import React, { useEffect, useState } from "react";
import { IntentModal } from "./components/intent-modal/intent-modal";
import "./intent-builder.scss";
import { DialogFlowTreeModel, StaticData } from "./data";
import { NodeType, DialogModel, IntentModel } from "./intent-builder.interface";
import { DialogModal } from "./components/dialog-modal/dialog-modal";
import { IOptional } from "@app/utills/types";

declare var d3: any;
let SVG_GROUP: any;

interface IConnection {
	DialogId: string;
	IntentId: string;
}

interface IntentBuilderProps {}
export const IntentBuilder: React.FC<IntentBuilderProps> = props => {
	const [dialogForm, setDialogForm] = useState<{ visible: boolean; data: IOptional<DialogModel> }>({ visible: false, data: {} });
	const [intentForm, setIntentForm] = useState<{ dialogId: string; visible: boolean }>({ dialogId: null, visible: false });

	const [data, setData] = useState<DialogFlowTreeModel[]>(StaticData);

	const viewerWidth = window.innerWidth;
	const viewerHeight = window.innerHeight;

	const dialogWidth = 270;
	const dialogHeight = 90;

	const intentBoxSize = { width: 200, height: 120, halfW: 100, halfH: 60 };
	const connections: IConnection[] = [];

	const grabMultiConnection = (d: DialogFlowTreeModel, isHead?: boolean): void => {
		const intents = data.filter(a => a.NextDialogId === d.Id);
		if (isHead || intents.length > 1) {
			intents.forEach((intent, i) => {
				if (isHead || i > 0) {
					connections.push({ DialogId: d.Id, IntentId: intent.Id });
				}
			});
		}
	};

	const dataStructure = d3
		.stratify()
		.id((d: DialogFlowTreeModel) => d.Id)
		.parentId((d: DialogFlowTreeModel) => {
			if (d.type === NodeType.DialogFlow) {
				return null;
			}
			if (d.type === NodeType.Dialog && d.IsHead) {
				grabMultiConnection(d, true);
				return d.DialogFlowId;
			}
			if (d.type === NodeType.Dialog) {
				const intent = data.find(a => a.NextDialogId === d.Id);
				grabMultiConnection(d);
				return intent.Id;
			}
			if (d.type === NodeType.Intent) {
				return d.DialogId;
			}
		})(data);
	const treeStructure = d3.tree().size([viewerWidth, viewerHeight]);
	const information = treeStructure(dataStructure);
	const descendants = information.descendants();
	const links = information.links();

	useEffect(() => {
		const svg = d3
			.select("#content")
			.append("svg")
			.attr("width", viewerWidth)
			.attr("height", viewerHeight);
		SVG_GROUP = svg.append("g");
		const zoomListener = d3
			.zoom()
			.scaleExtent([0.1, 3])
			.on("zoom", () => {
				SVG_GROUP.attr("transform", d3.event.transform);
			});
		svg.call(zoomListener);
	}, []);

	useEffect(() => {
		/**
		 * Clean SVG contents
		 */
		clearSvg();

		/**
		 * Re-render SVG elements
		 */
		renderConnections();
		renderMultiConnections();
		renderDialogFlow();
		renderDialogs();
		renderIntents();
	}, [data]);

	const clearSvg = (): void => {
		SVG_GROUP.selectAll("*").remove();
	};

	const renderConnections = (): void => {
		const linksView = SVG_GROUP.append("g")
			.attr("class", "g-group1")
			.selectAll()
			.data(links)
			.enter();

		linksView
			.append("path")
			.attr("d", d => {
				return `M${d.source.x},${d.source.depth * 200 + dialogHeight} v 30 H${d.target.x} V${d.target.depth * 200 + dialogHeight}`;
			})
			.attr("class", "g-intent__connection");
	};

	const renderMultiConnections = (): void => {
		const connectionData = links
			.map((l: any) => {
				const d: DialogFlowTreeModel = l.target.data;
				const isIntent = d.type === NodeType.Intent;
				if (isIntent) {
					const connectionIndex = connections.findIndex(c => c.IntentId === d.Id);
					if (connectionIndex !== -1) {
						l.connection = { ...connections[connectionIndex] };
						l.connection.index = connectionIndex;
					}
				}
				return l;
			})
			.filter((l: any) => !!l.connection);
		const connectionView = SVG_GROUP.append("g")
			.attr("class", "g-connections")
			.selectAll()
			.data(connectionData)
			.enter();
		connectionView
			.append("path")
			.attr("d", d => {
				const intent = d.target;
				const dialog = links.find(l => l.target.id === d.connection.DialogId).target;
				const connectionIndex = d.connection.index;
				return `M${intent.x}, ${intent.depth * 200 + intentBoxSize.height} v${connectionIndex * 10 + 35} H${dialog.x + (connectionIndex * 10 + 5)} V${dialog.depth * 200}`;
			})
			.attr("class", "g-intent__connection");
	};

	const renderDialogFlow = (): void => {
		const dialogFlowView = SVG_GROUP.append("g")
			.attr("class", "g-dialogflow")
			.selectAll()
			.data(descendants.filter(a => a.data.type === NodeType.DialogFlow))
			.enter();

		dialogFlowView
			.append("circle")
			.attr("cx", d => d.x)
			.attr("cy", d => d.y + 50)
			.attr("r", 50)
			.attr("class", "g-dialogflow__item");

		dialogFlowView
			.append("text")
			.text(d => d.data.Name)
			.attr("x", d => d.x + 50 + 20)
			.attr("y", d => d.depth * 200 + 50)
			.attr("class", "g-dialogflow__name");
		if (descendants.length === 1) {
			dialogFlowView
				.append("text")
				.text(d => "+")
				.attr("x", d => d.x - 17)
				.attr("y", d => d.depth * 200 + 50 + 12)
				.attr("class", "g-dialogflow__action")
				.on("click", openDialogForm);
		}
	};
	const renderDialogs = (): void => {
		const dialogView = SVG_GROUP.append("g")
			.attr("class", "g-dialog")
			.selectAll()
			.data(descendants.filter(a => a.data.type === NodeType.Dialog))
			.enter();

		dialogView
			.append("path")
			.attr("d", d => {
				const data = d.data as DialogFlowTreeModel;
				if (data.type === NodeType.DialogFlow) {
					return "";
				}
				return `M${d.x - dialogWidth / 2} ${d.depth * 200} l ${dialogWidth} 0 v ${dialogHeight} l -40 0 l -20 20 l 0 -20 l -${dialogWidth - 60} 0 v -${dialogHeight + 2}`;
			})
			.attr("class", "g-dialog__item")
			.attr("data:id", d => d.id);

		const charThreshold = 33;
		dialogView
			.append("text")
			.text(d => {
				// return d.data.Id;
				const text = d.data.Value;
				if (text.length <= charThreshold) return text;
				return text.substr(0, charThreshold).concat("...");
			})
			.attr("x", d => d.x - dialogWidth / 2 + 18)
			.attr("y", d => d.depth * 200 + 25)
			.attr("class", "g-dialog__name")
			.on("click", openDialogForm);

		dialogView
			.append("text")
			.text(d => "+ Intent")
			.attr("x", d => d.x + 65)
			.attr("y", d => d.depth * 200 + (dialogHeight - 20))
			.attr("class", "g-dialog__action")
			.on("click", addIntentModal);
	};

	const renderIntents = (): void => {
		const intentView = SVG_GROUP.append("g")
			.attr("class", "g-intent")
			.selectAll()
			.data(descendants.filter(a => a.data.type === NodeType.Intent))
			.enter();

		intentView
			.append("path")
			.attr("d", d => {
				const data = d.data as DialogFlowTreeModel;
				if (data.type === NodeType.DialogFlow) {
					return "";
				}
				return `M${d.x} ${d.depth * 200} l${intentBoxSize.halfW} ${intentBoxSize.halfH} l-${intentBoxSize.halfW} ${intentBoxSize.halfH} l-${intentBoxSize.halfW} -${
					intentBoxSize.halfH
				} l${intentBoxSize.halfW} -${intentBoxSize.halfH}`;
			})
			.attr("class", "g-intent__item");
		intentView
			.append("text")
			.text(d => d.data.Value)
			.attr("x", d => d.x - intentBoxSize.halfW + 30)
			.attr("y", d => d.depth * 200 + intentBoxSize.halfH)
			.attr("class", "g-dialog__name");

		const getDropableDialog = (): [DialogModel, any] => {
			const source = d3.event.sourceEvent.target;
			const sourceData = source.__data__ && source.__data__.data;
			if (sourceData && sourceData.type === NodeType.Dialog) {
				const sourceElement = d3.select(`path.g-dialog__item[id="${sourceData.Id}"]`);
				return [sourceData as DialogModel, sourceElement];
			}
			return [null, null];
		};

		const drag = d3
			.drag()
			.on("start", function(this: SVGCircleElement) {
				this.classList.add("g-intent__drag--selected");
			})
			.on("drag", function(this: SVGCircleElement) {
				this.style.transition = "none";
				const [x, y] = d3.mouse(this);
				this.setAttribute("cx", x);
				this.setAttribute("cy", y);

				d3.selectAll(".g-dialog__item--dropping").classed("g-dialog__item--dropping", false);
				const [dialog, element] = getDropableDialog();
				if (dialog) {
					element.classed("g-dialog__item--dropping", true);
				}
				// element.classList.add("g-dialog__item--dropping");
			})
			.on("end", function(this: SVGCircleElement, d) {
				/**
				 * Re-adjust dragging circle
				 */
				d3.selectAll(".g-dialog__item--dropping").classed("g-dialog__item--dropping", false);
				this.classList.remove("g-intent__drag--selected");
				this.setAttribute("cx", d.x);
				this.setAttribute("cy", (d.depth * 200 + intentBoxSize.height).toString());

				/**
				 * Updating connections
				 */
				const [dialog] = getDropableDialog();
				const intent = d.data as IntentModel;

				if (dialog && intent.NextDialogId !== dialog.Id) {
					let newData = [...data];
					const intentIndex = newData.findIndex(n => n.type === NodeType.Intent && n.Id === intent.Id);
					if (intentIndex !== -1) {
						const intent = newData[intentIndex] as IntentModel;
						const node = { ...intent, NextDialogId: dialog.Id };

						newData.splice(intentIndex, 1);
						newData.push(node);

						const dependentChildren = checkIfHasDependentChildren(intent);
						if (dependentChildren) {
							if (!confirm("The intent, you are connecting to another dialog, it has dependent children. By clicking 'confirm' they would be deleted.")) {
								return null;
							}
							newData = deleteNode(newData, intent.NextDialogId);
						}
						setData(newData);
					}
				}
			});

		intentView
			.append("circle")
			.attr("cx", d => d.x)
			.attr("cy", d => d.depth * 200 + intentBoxSize.height)
			.attr("r", 10)
			.attr("class", "g-intent__drag")
			.call(drag);
	};

	const checkIfHasDependentChildren = (intent: IntentModel) => {
		const nextDialog = data.find(n => n.type === NodeType.Dialog && n.Id === intent.NextDialogId);
		if (nextDialog) {
			const nextDialogParents = data.filter(n => n.NextDialogId === nextDialog.Id);
			return nextDialogParents.length < 2;
		}
		return false;
	};

	const openDialogForm = (d: any) => {
		const data = d.data as DialogFlowTreeModel;
		const isHead = !data.DialogFlowId;
		if (isHead) {
			setDialogForm({ visible: true, data: { DialogFlowId: data.Id, IsHead: true } });
		} else {
			setDialogForm({ visible: true, data });
		}
	};

	const closeDialogForm = (): void => {
		setDialogForm({ visible: false, data: {} });
	};

	const onDialogCreate = (dialog: DialogModel, intents?: IntentModel[]): void => {
		/**
		 * Building intents based on options of a dialog
		 */
		let intentsData = [];
		if (!!intents) {
			intents.forEach(i => {
				intentsData.push(
					...buildIntent({
						...i,
						Id: Math.random()
							.toString(36)
							.substring(2, 15),
						DialogId: dialog.Id,
						type: NodeType.Intent
					})
				);
			});
		}

		/**
		 * Updating dialog with its intents
		 */
		const index = data.findIndex(d => d.Id === dialog.Id);
		const isNew = index === -1;
		if (!isNew) {
			let newData = [...data];

			/**
			 * Removing existing dialog
			 */
			newData.splice(index, 1);

			/**
			 * Removing its options
			 */
			const options = data.filter(d => d.DialogId === dialog.Id && d.type === NodeType.Intent && !!d.ImageUrl);
			options.forEach(option => {
				newData = deleteNode(newData, option.Id);
			});

			/**
			 * Saving the data
			 */
			setData([...newData, dialog, ...intentsData]);
		} else {
			setData([...data, dialog, ...intentsData]);
		}

		closeDialogForm();
	};

	const buildDefaultDialog = (): DialogModel => {
		return {
			Id: Math.random()
				.toString(36)
				.substring(2, 15),
			DialogFlowId: data.find(a => a.type === NodeType.DialogFlow).Id,
			type: NodeType.Dialog,
			Value: "Default",
			IsHead: false
		};
	};

	const addIntentModal = (d: any): void => {
		const data = d.data as DialogModel;
		setIntentForm({ visible: true, dialogId: data.Id });
	};

	const closeIntentModal = (): void => {
		setIntentForm({ visible: false, dialogId: null });
	};

	const buildIntent = (intent: IntentModel): DialogFlowTreeModel[] => {
		const defaultDialog = buildDefaultDialog();
		intent.NextDialogId = defaultDialog.Id;
		return [defaultDialog, intent];
	};

	const onIntentCreate = (intent: IntentModel): void => {
		const intentData = buildIntent(intent);
		setData([...data, ...intentData]);
		closeIntentModal();
	};

	const dialogWithMultipleParents = (nodes: DialogFlowTreeModel[], nodeIds: string[]): string[] => {
		const ids = nodeIds.filter(nodeId => {
			const node = nodes.find(n => n.Id === nodeId);
			if (node.type === NodeType.Dialog) {
				const isDialogHasMultiChildren = nodes.filter(n => n.type === NodeType.Intent && n.NextDialogId === node.Id);
				if (isDialogHasMultiChildren.length > 1) {
					return false;
				}
			}
			return true;
		});
		return ids;
	};

	const deleteNode = (nodes: DialogFlowTreeModel[], id: string): DialogFlowTreeModel[] => {
		const node = descendants.find(d => d.id === id);
		let ids = [node.id];
		const findChildrenIds = node => {
			if (node.children) {
				node.children.forEach(n => {
					ids.push(n.id);
					findChildrenIds(n);
				});
			}
		};
		findChildrenIds(node);
		ids = dialogWithMultipleParents(nodes, ids);
		return nodes.filter(n => ids.findIndex(id => id === n.Id) === -1);
	};

	return (
		<>
			<div id="content"></div>
			<DialogModal {...dialogForm} onClose={closeDialogForm} onCreate={onDialogCreate} />
			<IntentModal {...intentForm} onClose={closeIntentModal} onCreate={onIntentCreate} />
		</>
	);
};
