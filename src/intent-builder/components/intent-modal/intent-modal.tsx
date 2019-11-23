import { IntentModel, NodeType, UtteranceModel } from "@app/intent-builder/intent-builder.interface";
import { IOptional } from "@app/utills/types";
import { Divider, Empty, Icon, Input, List, Modal, Typography } from "antd";
import Form, { FormComponentProps } from "antd/lib/form";
import React, { useState, useEffect } from "react";

interface IntentModalProps extends FormComponentProps {
	visible: boolean;
	data: IOptional<IntentModel>;
	onClose: () => void;
	onCreate: (intent: IntentModel) => void;
}

const IntentModalComponent: React.FC<IntentModalProps> = props => {
	const { visible, onClose, onCreate, form, data } = props;
	const { value, imageUrl, id, utterances: defaultUtterances } = data;
	const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields } = form;

	const [utterance, setUtterance] = useState<string>("");
	const isNew = !id;

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				let intent: IntentModel = {
					...(data as IntentModel),
					...values,
					type: NodeType.Intent
				};
				if (isNew) {
					intent.id = Math.random()
						.toString(36)
						.substring(2, 15);
				}
				onCreate(intent);
				resetFields();
			}
		});
	};

	const addUtterance = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		const utterance = event.currentTarget.value;
		if (utterance && !!utterance.length) {
			const previousUtterances = getFieldValue("utterances");
			const newUtterance = {
				id: Math.random()
					.toString(36)
					.substring(2, 15),
				value: utterance
			};
			setFieldsValue({ utterances: [newUtterance, ...previousUtterances] });
			setUtterance("");
		}
	};
	const removeUtterance = (index: number): void => {
		const utterances = getFieldValue("utterances") as string[];
		utterances.splice(index, 1);
		setFieldsValue({ utterances });
	};

	const closeHandler = () => {
		resetFields();
		onClose();
	};

	getFieldDecorator("utterances", { initialValue: defaultUtterances ? defaultUtterances : [] });
	const utterances = getFieldValue("utterances");

	return (
		<Modal title="Intent" visible={visible} onCancel={closeHandler} okText="Submit" onOk={submitHandler as any} destroyOnClose width={800}>
			<Form layout="vertical" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }} label="Intent Name">
					{getFieldDecorator("value", {
						initialValue: value,
						rules: [{ required: true, message: "Text is required!" }]
					})(<Input placeholder="Enter text" />)}
				</Form.Item>
				<Form.Item style={{ marginBottom: 10 }} label="Image">
					{getFieldDecorator("imageUrl", {
						initialValue: imageUrl,
						rules: []
					})(<Input placeholder="Enter URL" />)}
				</Form.Item>
				<Divider />
				<Typography.Title level={3}>Utterances</Typography.Title>
				<Form.Item style={{ marginBottom: 0 }}>
					<Input placeholder="Enter Utterance" onPressEnter={addUtterance} value={utterance} onChange={e => setUtterance(e.currentTarget.value)} />
				</Form.Item>
				<List
					bordered
					size="small"
					dataSource={utterances}
					locale={{ emptyText: <Empty description="No utterances" /> }}
					renderItem={(utterance: UtteranceModel, index: number) => (
						<List.Item actions={[<Icon type="close" onClick={() => removeUtterance(index)} />]}>{utterance.value}</List.Item>
					)}
				/>
			</Form>
		</Modal>
	);
};

export const IntentModal = Form.create<IntentModalProps>({ name: "intent-form" })(IntentModalComponent);
