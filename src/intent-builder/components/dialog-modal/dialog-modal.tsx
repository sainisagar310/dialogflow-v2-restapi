import React, { useRef } from "react";
import { Modal, Input, Checkbox } from "antd";
import { IOptional } from "@app/utills/types";
import Form, { FormProps } from "antd/lib/form";
import { DialogModel, NodeType } from "@app/intent-builder/intent-builder.interface";

interface DialogModalProps extends IOptional<FormProps> {
	visible: boolean;
	dialogFlowId: string;
	onClose: () => void;
	onCreate: (dialog: DialogModel) => void;
}

const DialogModalComponent: React.FC<DialogModalProps> = props => {
	const { visible, onClose, onCreate, form, dialogFlowId } = props;
	const { getFieldDecorator } = form;

	const formRef = useRef<Form>(null);

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				const data: DialogModel = {
					type: NodeType.Dialog,
					Id: Math.random()
						.toString(36)
						.substring(2, 15),
					DialogFlowId: dialogFlowId,
					...values
				};
				onCreate(data);
			}
		});
	};

	return (
		<Modal title="Add Dialog" visible={visible} onCancel={onClose} okText="Submit" onOk={submitHandler}>
			<Form ref={formRef} layout="horizontal" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("Value", {
						initialValue: "",
						rules: [{ required: true, message: "Text is required!" }]
					})(<Input placeholder="Enter text" />)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator("IsHead", {
						initialValue: "",
						rules: []
					})(<Checkbox>Is Head</Checkbox>)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export const DialogModal = Form.create({ name: "dialog-form" })(DialogModalComponent);
