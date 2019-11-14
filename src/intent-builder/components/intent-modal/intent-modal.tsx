import React from "react";
import { IntentsData } from "@app/intent-builder/intent-builder.interface";
import { Modal, Form, Input, Typography, Divider, Icon } from "antd";
import { FormProps } from "antd/lib/form";
import { IOptional } from "@app/utills/types";
import "./intent-modal.scss";

let answerkeyCount = 1;
let questionkeyCount = 1;

interface IntentModalProps extends IOptional<FormProps> {
	visible: boolean;
	onClose: () => void;
	data: IntentsData;
}
const IntentModalWithForm: React.FC<IntentModalProps> = props => {
	const { data, onClose, visible, form } = props;

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onClose();
	};

	const addAnswerField = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const answerKeys = form.getFieldValue("answerKeys");
		const nextAnswerKeys = answerKeys.concat(answerkeyCount++);
		form.setFieldsValue({
			answerKeys: nextAnswerKeys
		});
	};
	const addQuestionField = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const questionKeys = form.getFieldValue("questionKeys");
		const nextQuestionKeys = questionKeys.concat(questionkeyCount++);
		form.setFieldsValue({
			questionKeys: nextQuestionKeys
		});
	};

	const removeAnswerField = (k: number) => {
		debugger;
		const answerKeys = form.getFieldValue("answerKeys");
		if (answerKeys.length === 1) {
			return;
		}
		form.setFieldsValue({
			keys: answerKeys.filter(key => key !== k)
		});
	};

	const { getFieldValue, getFieldDecorator } = form;

	getFieldDecorator("answerKeys", { initialValue: [0] });
	getFieldDecorator("questionKeys", { initialValue: [0] });
	const answerKeys = getFieldValue("answerKeys");
	const questionKeys = getFieldValue("questionKeys");

	return (
		<Modal title={data && data.name} visible={visible} onOk={onClose} onCancel={onClose} width={1200}>
			{data && (
				<>
					<Form layout="horizontal" onSubmit={onSubmit} className="in-form">
						<div className="in-form__answers">
							<Typography.Title level={4}>Answers</Typography.Title>
							{answerKeys.map((k, index) => (
								<Form.Item key={k} required={false} style={{ marginBottom: 2 }}>
									{getFieldDecorator(`utterance[${index}]`, {
										initialValue: "",
										validateTrigger: ["onChange", "onBlur"],
										rules: []
									})(<Input placeholder="type answer..." onPressEnter={addAnswerField} autoFocus={!!index} suffix={<Icon type="minus-circle-o" onClick={() => removeAnswerField(k)} />} />)}
								</Form.Item>
							))}
						</div>
						<Divider />
						<div className="in-form__answers">
							<Typography.Title level={4}>Questions</Typography.Title>
							{questionKeys.map((k, index) => (
								<Form.Item key={k} required={false} style={{ marginBottom: 2 }}>
									{getFieldDecorator(`responses[${index}]`, {
										initialValue: "",
										validateTrigger: ["onChange", "onBlur"],
										rules: []
									})(
										<Input placeholder="type answer..." onPressEnter={addQuestionField} autoFocus={!!index} suffix={<Icon type="minus-circle-o" onClick={() => removeAnswerField(k)} />} />
									)}
								</Form.Item>
							))}
						</div>
					</Form>
					<pre>{JSON.stringify(form.getFieldsValue())}</pre>
				</>
			)}
		</Modal>
	);
};

export const IntentModal = Form.create({ name: "intent-form" })(IntentModalWithForm);
