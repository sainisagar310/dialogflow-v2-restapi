import { DialogModel, NodeType, DialogFlowModel } from "@app/intent-builder/intent-builder.interface";
import { IOptional } from "@app/utills/types";
import { Input, Modal } from "antd";
import Form, { FormComponentProps } from "antd/lib/form";
import React from "react";
import TextArea from "antd/lib/input/TextArea";

interface DialogflowModalProps extends FormComponentProps {
	visible: boolean;
	data: IOptional<DialogFlowModel>;
	onClose: () => void;
	onCreate: (dialogflow: DialogFlowModel) => void;
}

const DialogflowModalComponent: React.FC<DialogflowModalProps> = props => {
	const { visible, onClose, onCreate, form, data } = props;
	const { getFieldDecorator } = form;
	const { id, value, description } = data;

	const isEdit = !!id;

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			values.unit = 0;
			values.order = 0;
			if (!err) {
				let dialogflow: DialogFlowModel;
				if (isEdit) {
					dialogflow = {
						...(data as DialogFlowModel),
						...values
					};
				} else {
					dialogflow = {
						type: NodeType.DialogFlow,
						id: Math.random()
							.toString(36)
							.substring(2, 15),
						...values
					};
				}
				onCreate(dialogflow);
			}
		});
	};

	return (
		<Modal title="Dialogflow" visible={visible} onCancel={onClose} okText="Submit" onOk={submitHandler as any} destroyOnClose width={800}>
			<Form layout="horizontal" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("value", {
						initialValue: value,
						rules: [{ required: true, message: "Name is required!" }]
					})(<Input placeholder="Name" />)}
				</Form.Item>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("description", {
						initialValue: description,
						rules: []
					})(<TextArea placeholder="Description" />)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export const DialogflowModal = Form.create<DialogflowModalProps>({ name: "dialogflow-form" })(DialogflowModalComponent);
