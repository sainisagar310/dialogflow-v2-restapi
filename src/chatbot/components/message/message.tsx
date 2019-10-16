import { IMessage, AIMessage, USERMessage, IMessages, MessageType } from "@app/chatbot/interfaces/message";
import React from "react";
import "./message.scss";
import { BasicCardComponent } from "./components/basic-card/basic-card";
import { IBasicCard } from "./google-assistant-types";

interface MessagesProps {
	messages: IMessages;
}

export const Messages: React.FC<MessagesProps> = props => {
	const { messages } = props;
	return (
		<div className="chat__messages">
			{messages.map((res, key) => (
				<Message message={res} key={key} />
			))}
		</div>
	);
};

interface MessageProps {
	message: IMessage;
}

export const Message: React.FC<MessageProps> = props => {
	const { message } = props;

	const renderComponents = (message: AIMessage): React.ReactNode => {
		const components = [];
		const basicCard = message.queryResult.fulfillmentMessages.find(({ platform, basicCard }) => platform === "ACTIONS_ON_GOOGLE" && basicCard);
		if (basicCard) {
			components.push(<BasicCardComponent key="0" {...(basicCard.basicCard as IBasicCard)} />);
		}
		return components;
	};

	if (message.type === MessageType.AI) {
		return (
			<>
				{renderComponents(message as AIMessage)}
				<AIMessageComponent message={message as AIMessage} />
			</>
		);
	}
	return <USERMessageComponent message={message as USERMessage} />;
};

interface AIMessageProps {
	message: AIMessage;
}

export const AIMessageComponent: React.FC<AIMessageProps> = props => {
	const {
		message: {
			queryResult: { fulfillmentText }
		}
	} = props;

	return <div className="chat__message chat__message--left">{fulfillmentText}</div>;
};

interface USERMessageProps {
	message: USERMessage;
}

export const USERMessageComponent: React.FC<USERMessageProps> = props => {
	const {
		message: { text }
	} = props;

	return <div className="chat__message chat__message--right">{text}</div>;
};
