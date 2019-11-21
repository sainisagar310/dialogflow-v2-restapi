import { IntentModel, NodeType } from "@app/intent-builder/intent-builder.interface";
import { Input, Modal } from "antd";
import Form, { FormComponentProps } from "antd/lib/form";
import React, { useRef } from "react";

interface IntentModalProps extends FormComponentProps {
	visible: boolean;
	dialogId: string;
	onClose: () => void;
	onCreate: (intent: IntentModel) => void;
}

const IntentModalComponent: React.FC<IntentModalProps> = props => {
	const { visible, onClose, onCreate, form, dialogId } = props;
	const { getFieldDecorator } = form;

	const formRef = useRef<Form>(null);

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				const data: IntentModel = {
					type: NodeType.Intent,
					Id: Math.random()
						.toString(36)
						.substring(2, 15),
					DialogId: dialogId,
					...values
				};
				onCreate(data);
			}
		});
	};

	return (
		<Modal title="Add Intent" visible={visible} onCancel={onClose} okText="Submit" onOk={submitHandler as any} destroyOnClose>
			<Form ref={formRef} layout="horizontal" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("Value", {
						initialValue: "",
						rules: [{ required: true, message: "Text is required!" }]
					})(<Input placeholder="Enter text" />)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export const IntentModal = Form.create<IntentModalProps>({ name: "intent-form" })(IntentModalComponent);
