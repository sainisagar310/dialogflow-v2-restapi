import React, { useEffect, useState } from "react";
import { IntentModal } from "./components/intent-modal/intent-modal";
import "./intent-builder.scss";
import { DialogFlowTreeNode, DialogFlowResponse } from "./data";
import { NodeType, DialogModel, IntentModel, DialogFlowModel } from "./intent-builder.interface";
import { DialogModal } from "./components/dialog-modal/dialog-modal";
import { IOptional } from "@app/utills/types";
import Axios from "axios";
import { Layout, Typography, Row, Col, Button, Icon, Dropdown, Menu } from "antd";
import { DialogflowModal } from "./components/dialogflow-modal/dialogflow-modal";

const { Header, Content } = Layout;

Axios.defaults.baseURL = "https://localhost:44389/api";

const Apis = {
	GetDialogFlowList: "/Talkmode/GetTalkModeList",
	GetDialogFlow: "/Talkmode/GetTalkModeUI",
	UpdateDialogFlow: "/Talkmode/PutTalkMode",
	CreateDialogFlow: "/Talkmode/PostTalkMode"
};

declare var d3: any;
let SVG_GROUP: any;
let dataStructure: any;
let treeStructure: any;
let information: any;
let descendants: any;
let links: any;

interface IConnection {
	DialogId: string;
	IntentId: string;
}

interface IntentBuilderProps {}
export const IntentBuilder: React.FC<IntentBuilderProps> = props => {
	const [dialogflowForm, setDialogflowForm] = useState<{ data: IOptional<DialogFlowModel>; visible: boolean }>({ data: {}, visible: false });
	const [dialogForm, setDialogForm] = useState<{ visible: boolean; data: IOptional<DialogModel> }>({ visible: false, data: {} });
	const [intentForm, setIntentForm] = useState<{ data: IOptional<IntentModel>; visible: boolean }>({ data: {}, visible: false });

	const [dialogFlowInfo, setDialogFlowInfo] = useState<DialogFlowModel>(null);
	const [data, setData] = useState<DialogFlowTreeNode[]>([]);

	const [loading, setLoading] = useState<boolean>(false);

	const [dialogflowList, setDialogflowList] = useState<DialogFlowModel[]>([]);
	const [dialogflowListLoading, setDialogflowListLoading] = useState<boolean>(false);

	const viewerWidth = window.innerWidth;
	const viewerHeight = window.innerHeight - 64;

	const dialogWidth = 270;
	const dialogHeight = 90;

	const intentBoxSize = { width: 200, height: 120, halfW: 100, halfH: 60 };
	const connections: IConnection[] = [];

	useEffect(() => {
		getDialogflowList();
		insertSVG();
	}, []);

	useEffect(() => {
		/**
		 * Clean SVG contents
		 */
		clearSvg();

		if (data && !!data.length) {
			initializeTree();

			/**
			 * Re-render SVG elements
			 */
			renderConnections();
			renderMultiConnections();
			renderDialogFlow();
			renderDialogs();
			renderIntents();
		}
	}, [data]);

	const loadDialogflow = (id: string) => {
		setLoading(true);
		getDialogFlow(id)
			.then(res => {
				setDialogflowData(res.data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const setDialogflowData = (data: DialogFlowResponse) => {
		const { id, name, description, unit, order, type, dialogFlow } = data;
		setDialogFlowInfo({ id, name, value: name, description, unit, order, type });
		setData(dialogFlow);
	};

	const getDialogFlow = (id: string) => {
		return Axios.get<DialogFlowResponse>(`${Apis.GetDialogFlow}/${id}`);
	};

	const insertSVG = () => {
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
	};

	const initializeTree = () => {
		dataStructure = d3
			.stratify()
			.id((d: DialogFlowTreeNode) => d.id)
			.parentId((d: DialogFlowTreeNode) => {
				if (d.type === NodeType.DialogFlow) {
					return null;
				}
				if (d.type === NodeType.Dialog && d.isHead) {
					grabMultiConnection(d, true);
					return data.find(node => node.type === NodeType.DialogFlow).id;
				}
				if (d.type === NodeType.Dialog) {
					const intent = data.find(a => a.nextDialogId === d.id);
					grabMultiConnection(d);
					return intent.id;
				}
				if (d.type === NodeType.Intent) {
					return d.dialogId;
				}
			})(data);
		treeStructure = d3.tree().size([viewerWidth, viewerHeight]);
		information = treeStructure(dataStructure);
		descendants = information.descendants();
		links = information.links();
	};

	const grabMultiConnection = (d: DialogFlowTreeNode, isHead?: boolean): void => {
		const intents = data.filter(a => a.nextDialogId === d.id);
		const skipFirstIntent = !isHead;
		const hasMultipleIntents = intents.length > 1;
		if (!skipFirstIntent || hasMultipleIntents) {
			intents.forEach((intent, i) => {
				const isSkipped = skipFirstIntent && i === 0;
				if (!isSkipped) {
					connections.push({ DialogId: d.id, IntentId: intent.id });
				}
			});
		}
	};

	const clearSvg = (): void => {
		if (SVG_GROUP) {
			SVG_GROUP.selectAll("*").remove();
		}
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
				const d: DialogFlowTreeNode = l.target.data;
				const isIntent = d.type === NodeType.Intent;
				if (isIntent) {
					const connectionIndex = connections.findIndex(c => c.IntentId === d.id);
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
			.attr("cy", d => d.y + 65)
			.attr("r", 50)
			.attr("class", "g-dialogflow__item");

		dialogFlowView
			.append("text")
			.text(d => d.data.value)
			.attr("x", d => d.x + 50 + 20)
			.attr("y", d => d.depth * 200 + 65)
			.attr("class", "g-dialogflow__name")
			.on("click", openDialogflowModal);
		if (descendants.length === 1) {
			dialogFlowView
				.append("text")
				.text(d => "+")
				.attr("x", d => d.x - 17)
				.attr("y", d => d.depth * 200 + 50 + 27)
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
				const data = d.data as DialogFlowTreeNode;
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
				const text = d.data.value;
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
			.on("click", openIntentModal);
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
				const data = d.data as DialogFlowTreeNode;
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
			.text(d => d.data.value)
			.attr("x", d => d.x - intentBoxSize.halfW + 30)
			.attr("y", d => d.depth * 200 + intentBoxSize.halfH)
			.attr("class", "g-dialog__name")
			.on("click", openIntentModal);

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

				if (dialog && intent.nextDialogId !== dialog.id) {
					let newData = [...data];
					const intentIndex = newData.findIndex(n => n.type === NodeType.Intent && n.id === intent.id);
					if (intentIndex !== -1) {
						const intent = newData[intentIndex] as IntentModel;
						const node = { ...intent, nextDialogId: dialog.id } as IntentModel;

						newData.splice(intentIndex, 1);
						newData.push(node);

						const dependentChildren = checkIfHasDependentChildren(intent);
						if (dependentChildren) {
							if (!confirm("The intent, you are connecting to another dialog, it has dependent children. By clicking 'confirm' they would be deleted.")) {
								return null;
							}
							newData = deleteNode(newData, intent.nextDialogId);
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
		const nextDialog = data.find(n => n.type === NodeType.Dialog && n.id === intent.nextDialogId);
		if (nextDialog) {
			const nextDialogParents = data.filter(n => n.nextDialogId === nextDialog.id);
			return nextDialogParents.length < 2;
		}
		return false;
	};

	const openDialogForm = (d: { data: DialogFlowTreeNode }) => {
		const node = d.data;
		const isHead = node.type === NodeType.DialogFlow || node.isHead;
		const isDialog = node.type === NodeType.Dialog;
		const dialog = isDialog ? node : ({} as DialogModel);
		setDialogForm({ visible: true, data: { ...dialog, isHead } });
	};

	const closeDialogForm = (): void => {
		setDialogForm({ visible: false, data: {} });
	};

	const onDialogCreate = (dialog: DialogModel): void => {
		const dialogIndex = data.findIndex(d => d.id === dialog.id);
		const isNew = dialogIndex === -1;
		const newData = [...data];
		if (!isNew) {
			newData.splice(dialogIndex, 1);
		}
		setData([...newData, dialog]);
		closeDialogForm();
	};

	const buildDefaultDialog = (): DialogModel => {
		return {
			id: Math.random()
				.toString(36)
				.substring(2, 15),
			type: NodeType.Dialog,
			value: "Default",
			isHead: false
		};
	};

	const openIntentModal = (d: { data: DialogFlowTreeNode }): void => {
		const data = d.data as DialogFlowTreeNode;
		const isIntent = data.type === NodeType.Intent;
		const intent = isIntent ? data : {};
		setIntentForm({ visible: true, data: { dialogId: data.id, ...intent } });
	};

	const closeIntentModal = (): void => {
		setIntentForm({ visible: false, data: {} });
	};

	const buildIntent = (intent: IntentModel): DialogFlowTreeNode[] => {
		const defaultDialog = buildDefaultDialog();
		intent.nextDialogId = defaultDialog.id;
		return [defaultDialog, intent];
	};

	const onIntentCreate = (intent: IntentModel): void => {
		const intentIndex = data.findIndex(d => d.id === intent.id);
		const isNew = intentIndex === -1;
		const newData = [...data];
		if (!isNew) {
			newData[intentIndex] = intent;
			setData(newData);
		} else {
			const intentData = buildIntent(intent);
			setData([...newData, ...intentData]);
		}
		closeIntentModal();
	};

	const dialogWithMultipleParents = (nodes: DialogFlowTreeNode[], nodeIds: string[]): string[] => {
		const ids = nodeIds.filter(nodeId => {
			const node = nodes.find(n => n.id === nodeId);
			if (node.type === NodeType.Dialog) {
				const isDialogHasMultiChildren = nodes.filter(n => n.type === NodeType.Intent && n.nextDialogId === node.id);
				if (isDialogHasMultiChildren.length > 1) {
					return false;
				}
			}
			return true;
		});
		return ids;
	};

	const deleteNode = (nodes: DialogFlowTreeNode[], id: string): DialogFlowTreeNode[] => {
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
		return nodes.filter(n => ids.findIndex(id => id === n.id) === -1);
	};

	const onDialogflowCreate = (dialogflow: DialogFlowModel): void => {
		setDialogFlowInfo({ ...dialogflow, name: dialogflow.value });
		const index = data.findIndex(node => node.type === NodeType.DialogFlow);
		const newData = [...data];
		if (index !== -1) {
			newData[index] = dialogflow;
		} else {
			newData.push(dialogflow);
		}
		setData(newData);
		closeDialogflowModal();
	};

	const closeDialogflowModal = (): void => {
		setDialogflowForm({ data: {}, visible: false });
	};

	const openDialogflowModal = (): void => {
		setDialogflowForm({ data: dialogFlowInfo ? dialogFlowInfo : {}, visible: true });
	};

	const saveDialogFlow = (): void => {
		const isNew = dialogFlowInfo.id.length < 15;
		const call = isNew
			? Axios.post<DialogFlowResponse>(Apis.CreateDialogFlow, { ...dialogFlowInfo, dialogFlow: data })
			: Axios.put<DialogFlowResponse>(Apis.UpdateDialogFlow, { ...dialogFlowInfo, dialogFlow: data });
		call
			.then(res => {
				setDialogflowData(res.data);
			})
			.catch(err => {
				console.log(err);
			});
	};

	const getDialogflowList = () => {
		setDialogflowListLoading(true);
		Axios.get<DialogFlowModel[]>(Apis.GetDialogFlowList)
			.then(res => {
				setDialogflowListLoading(false);
				setDialogflowList(res.data as DialogFlowModel[]);
			})
			.catch(err => {
				setDialogflowListLoading(false);
			});
	};

	const discardDialogflow = () => {
		setData([]);
		setDialogFlowInfo(null);
	};

	const renderMenu = (): React.ReactNode => {
		return (
			<Menu>
				{dialogflowList.map(({ name, id }) => (
					<Menu.Item key={id} onClick={() => loadDialogflow(id)}>
						{name}
					</Menu.Item>
				))}
			</Menu>
		);
	};

	return (
		<Layout>
			<Header style={{ padding: "0 20px" }}>
				<Row type="flex" justify="space-between" align="middle">
					<Col>
						<Typography.Title level={4} style={{ marginBottom: 2, color: "#d8d8d8" }}>
							{dialogFlowInfo && dialogFlowInfo.name}
						</Typography.Title>
					</Col>
					<Col>
						{dialogFlowInfo && (
							<>
								<Button icon="arrow-left" ghost onClick={discardDialogflow} style={{ marginRight: 8 }} type="danger">
									Back
								</Button>
								<Button icon="save" ghost onClick={saveDialogFlow}>
									Save
								</Button>
							</>
						)}
						{!dialogFlowInfo && !loading && (
							<Dropdown.Button icon={<Icon type={dialogflowListLoading ? "loading" : "down"} />} onClick={openDialogflowModal} overlay={renderMenu()}>
								<Icon type="plus" /> New
							</Dropdown.Button>
						)}
					</Col>
				</Row>
			</Header>
			<Content>
				{loading && (
					<div className="tm-loader">
						<Icon type="loading" className="tm-loader__icon" />
					</div>
				)}
				<div id="content"></div>
				<DialogflowModal {...dialogflowForm} onClose={closeDialogflowModal} onCreate={onDialogflowCreate} />
				<DialogModal {...dialogForm} onClose={closeDialogForm} onCreate={onDialogCreate} />
				<IntentModal {...intentForm} onClose={closeIntentModal} onCreate={onIntentCreate} />
			</Content>
		</Layout>
	);
};
