import { DialogModel, NodeType, IntentModel } from "@app/intent-builder/intent-builder.interface";
import { Input, Modal, Checkbox, Button, Row, Col } from "antd";
import Form, { FormComponentProps } from "antd/lib/form";
import React, { useRef, useEffect } from "react";
import { IOptional } from "@app/utills/types";

interface DialogModalProps extends FormComponentProps {
	visible: boolean;
	data: IOptional<DialogModel>;
	onClose: () => void;
	onCreate: (dialog: DialogModel, intents?: IntentModel[]) => void;
}

let optionCount = 1;

const DialogModalComponent: React.FC<DialogModalProps> = props => {
	const { visible, onClose, onCreate, form, data } = props;
	const { getFieldDecorator, getFieldValue } = form;
	const { Id, DialogFlowId, IsHead, Value } = data;

	const isEdit = !!Id;

	const submitHandler = (event?: React.FormEvent<HTMLFormElement>) => {
		event && event.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				let dialog: DialogModel;
				if (isEdit) {
					dialog = {
						...(data as DialogModel),
						Value: values.Value
					};
				} else {
					dialog = {
						type: NodeType.Dialog,
						Id: Math.random()
							.toString(36)
							.substring(2, 15),
						DialogFlowId,
						IsHead,
						Value: values.Value
					};
				}
				const intents = values.option as IntentModel[];
				const isOptions = values.isOptions;
				onCreate(dialog, isOptions && intents);
			}
		});
	};

	const addOption = (): void => {
		const optionKeys = getFieldValue("optionKeys");
		const nextKeys = optionKeys.concat(optionCount++);
		form.setFieldsValue({
			optionKeys: nextKeys
		});
	};

	const renderList = (): React.ReactNode => {
		getFieldDecorator("optionKeys", { initialValue: [0] });
		const optionKeys = getFieldValue("optionKeys");
		return (
			<>
				<div style={{ marginBottom: 10 }}>
					{optionKeys.map((k, index) => (
						<Row key={k} type="flex" gutter={10}>
							<Col span={8}>
								<Form.Item required={false} style={{ marginBottom: 2 }}>
									{getFieldDecorator(`option[${k}]['Value']`, {
										rules: [{ required: true, message: "Intent name is required." }]
									})(<Input placeholder="Intent" />)}
								</Form.Item>
							</Col>
							<Col span={16}>
								<Form.Item required={false} style={{ marginBottom: 2 }}>
									{getFieldDecorator(`option[${k}]['ImageUrl']`, {
										rules: [{ required: true, message: "Image URL is required." }]
									})(<Input placeholder="Image URL" />)}
								</Form.Item>
							</Col>
						</Row>
					))}
				</div>
				<Button onClick={addOption}>Add Option</Button>
			</>
		);
	};

	return (
		<Modal title="Add Dialog" visible={visible} onCancel={onClose} okText="Submit" onOk={submitHandler as any} destroyOnClose width={800}>
			<Form layout="horizontal" onSubmit={submitHandler}>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("Value", {
						initialValue: Value ? Value : "",
						rules: [{ required: true, message: "Text is required!" }]
					})(<Input placeholder="Enter text" />)}
				</Form.Item>
				<Form.Item style={{ marginBottom: 10 }}>
					{getFieldDecorator("isOptions", {
						initialValue: false
					})(<Checkbox>Is Options</Checkbox>)}
				</Form.Item>
				{getFieldValue("isOptions") && renderList()}
			</Form>
		</Modal>
	);
};

export const DialogModal = Form.create<DialogModalProps>({ name: "dialog-form" })(DialogModalComponent);
