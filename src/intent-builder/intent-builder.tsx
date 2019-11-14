import React, { useEffect, useState } from "react";
import { IntentModal } from "./components/intent-modal/intent-modal";
// import * as d3Selecten from "d3-selection";
// import * as d3 from "d3";
// import * as d3Zoom from "d3-zoom";
import "./intent-builder.scss";
import { DialogFlowTreeModel, StaticData } from "./data";
import { NodeType, DialogModel } from "./intent-builder.interface";
import { DialogModal } from "./components/dialog-modal/dialog-modal";

declare var d3: any;
let svgGroup: any;

interface IntentBuilderProps {}
export const IntentBuilder: React.FC<IntentBuilderProps> = props => {
	const [visible, setVisible] = useState<boolean>(null);
	const [dialogForm, setDialogForm] = useState<{ dialogFlowId: string; visible: boolean }>({ dialogFlowId: null, visible: false });
	// const [selectedData, setSelectedData] = useState<DialogFlowTreeModel>(null);

	const [data, setData] = useState<DialogFlowTreeModel[]>(StaticData);

	const viewerWidth = window.innerWidth;
	const viewerHeight = window.innerHeight;

	const rectWidth = 270;
	const rectHeight = 90;

	const dataStructure = d3
		.stratify()
		.id((d: DialogFlowTreeModel) => d.Id)
		.parentId((d: DialogFlowTreeModel) => {
			if (d.type === NodeType.DialogFlow) {
				return null;
			}
			if (d.type === NodeType.Dialog && d.IsHead) {
				return d.DialogFlowId;
			}
			if (d.type === NodeType.Dialog) {
				const intent = data.find(a => a.NextDialogId === d.Id);
				if (intent) {
					return intent.Id;
				} else {
					debugger;
				}
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
		svgGroup = svg.append("g");
		const zoomListener = d3
			.zoom()
			.scaleExtent([0.1, 3])
			.on("zoom", () => {
				svgGroup.attr("transform", d3.event.transform);
			});
		svg.call(zoomListener);
	}, []);

	useEffect(() => {
		svgGroup.selectAll("*").remove();
		const linksView = svgGroup
			.append("g")
			.attr("class", "g-group1")
			.selectAll()
			.data(links)
			.enter();
		const descendantView = svgGroup
			.append("g")
			.attr("class", "g-group2")
			.selectAll()
			.data(descendants)
			.enter();

		linksView.append("path").attr("d", d => {
			return `M${d.source.x},${d.source.depth * 200 + rectHeight} v 30 H${d.target.x} V${d.target.depth * 200 + rectHeight}`;
		});

		// multi parents
		// linksView
		// 	.append("path")
		// 	.attr("d", d => {
		// 		const data = d.target.data;
		// 		if (data.parents && !!data.parents.length) {
		// 			const connections = data.parents.map(parent => descendants.find(info => info.id === parent.toString()));
		// 			const lines = connections.map(con => {
		// 				return `M${d.target.x - 5},${d.target.depth * 200 + rectHeight} v35 H${con.x + 5} V${con.depth * 200}`;
		// 			});
		// 			return lines.join(" ");
		// 		}
		// 	})
		// 	.style("stroke", "rgb(168, 214, 137)")
		// 	.attr("class", "parent-connection");

		descendantView
			.append("path")
			.attr("d", d => {
				const data = d.data as DialogFlowTreeModel;
				if (data.type === NodeType.DialogFlow) {
					return "";
				}
				return `M${d.x - rectWidth / 2} ${d.depth * 200} l ${rectWidth} 0 v ${rectHeight} l -40 0 l -20 20 l 0 -20 l -${rectWidth - 60} 0 v -${rectHeight + 1}`;
			})
			.attr("class", "conversation-box");

		/**
		 * Render Dialogflow
		 */
		const dialogFlowView = svgGroup
			.append("g")
			.attr("class", "g-group2")
			.selectAll()
			.data(descendants.filter(a => a.data.type === NodeType.DialogFlow))
			.enter();

		dialogFlowView
			.append("circle")
			.attr("cx", d => d.x)
			.attr("cy", d => d.y + 50)
			.attr("r", 50)
			.attr("class", "g-dialogflow");

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
				.on("click", addDialogModal);
		}

		// descendantView
		// 	.append("line")
		// 	.attr("x1", d => d.x - rectWidth / 2)
		// 	.attr("y1", d => d.y)
		// 	.attr("x2", d => d.x + rectWidth / 2)
		// 	.attr("y2", d => d.y);

		// descendantView
		// 	.append("text")
		// 	.text(d => d.data.Name || d.data.Value)
		// 	.attr("x", d => d.x - rectWidth / 2 + 20)
		// 	.attr("y", d => d.depth * 200 + 20);
		// .on("click", openModal);

		// descendantView
		// 	.append("text")
		// 	.text(d => "Add")
		// 	.on("click", d => {
		// 		addItem(d.data.id);
		// 	})
		// 	.style("cursor", "pointer")
		// 	.style("fill", "blue")
		// 	.attr("x", d => d.x - 25)
		// 	.attr("y", d => {
		// 		return d.depth * 200 + 40;
		// 	});

		// descendantView
		// 	.append("text")
		// 	.text(d => "-")
		// 	.on("click", d => {
		// 		removeItem(d.data.id);
		// 	})
		// 	.attr("x", d => d.x + 20)
		// 	.attr("y", d => d.y + 40);
	}, [data]);

	const addDialogModal = d => {
		const data = d.data as DialogFlowTreeModel;
		setDialogForm({ visible: true, dialogFlowId: data.Id });
	};

	const closeDialogModal = () => {
		setDialogForm({ visible: false, dialogFlowId: null });
	};

	const onDialogCreate = (dialog: DialogModel) => {
		setData([...data, dialog]);
		closeDialogModal();
	};

	// const addItem = parent => {
	// 	const item: IntentsData = {
	// 		id: data.length,
	// 		name: `Intent ${data.length}`,
	// 		parent: parent
	// 	};
	// 	setData([...data, item]);
	// };
	// const removeItem = id => {
	// 	const newData = [...data];
	// 	const item = newData.find(a => a.id === id);
	// 	const itemIndex = newData.findIndex(a => a.id === id);
	// 	const childrens = newData.map(a => {
	// 		if (a.parent === item.id) {
	// 			a.parent = item.parent;
	// 		}
	// 		return a;
	// 	});
	// 	childrens.splice(itemIndex, 1);
	// 	setData(childrens);
	// };

	// const closeModal = () => {
	// 	setVisible(false);
	// };
	// const openModal = d => {
	// 	setSelectedData(d.data);
	// 	setVisible(true);
	// };

	return (
		<>
			<div id="content"></div>
			<DialogModal {...dialogForm} onClose={closeDialogModal} onCreate={onDialogCreate} />
			{/* <IntentModal visible={visible} onClose={closeModal} data={selectedData} /> */}
		</>
	);
};
