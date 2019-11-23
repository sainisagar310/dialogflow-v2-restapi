import { DialogModel, NodeType } from "@app/intent-builder/intent-builder.interface";
import { IOptional } from "@app/utills/types";
import { Input, Modal } from "antd";
import Form, { FormComponentProps } from "antd/lib/form";
import React from "react";

interface DialogModalProps extends FormComponentProps {
	visible: boolean;
	data: IOptional<DialogModel>;
	onClose: () => void;
	onCreate: (dialog: DialogModel) => void;
}

const DialogModalComponent: React.FC<DialogModalProps> = props => {
	const { visible, onClose, onCreate, form, data } = props;
	const { getFieldDecorator } = form;
	const { id: Id, isHead: IsHead, value } = data;

	const isEdit = !!Id;

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				let dialog: DialogModel;
				if (isEdit) {
					dialog = {
						...(data as DialogModel),
						value: values.value
					};
				} else {
					dialog = {
						type: NodeType.Dialog,
						id: Math.random()
							.toString(36)
							.substring(2, 15),
						isHead: IsHead,
						value: values.value
					};
				}
				onCreate(dialog);
			}
		});
	};

	return (
		<Modal title="Dialog" visible={visible} onCancel={onClose} okText="Submit" onOk={submitHandler as any} destroyOnClose width={800}>
			<Form layout="horizontal" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("value", {
						initialValue: value ? value : "",
						rules: [{ required: true, message: "Text is required!" }]
					})(<Input placeholder="Enter text" />)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export const DialogModal = Form.create<DialogModalProps>({ name: "dialog-form" })(DialogModalComponent);
