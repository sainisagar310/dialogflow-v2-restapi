import { MatIcon } from "@app/components/mat-icon/mat-icon";
import { DialogflowSDK } from "@app/dialogflow-sdk/dialogflow-sdk";
import { DialogflowResponse } from "@app/dialogflow-sdk/response.interface";
import { onPressEnter } from "@app/utills/functions";
import { cloneDeep } from "lodash";
import React, { useEffect, useState } from "react";
import "./chatbot.scss";
import { Messages } from "./components/message/message";
import { IMessage, IMessages, MessageType, USERMessage } from "./interfaces/message";

const myClient = new DialogflowSDK("grapeseed-teacher");

let isUserAsked = false;

interface ChatbotProps {}

export const Chatbot: React.FC<ChatbotProps> = props => {
	const [text, setText] = useState<string>("");
	const [messages, setMessages] = useState<IMessages>([]);

	useEffect(() => {}, []);

	useEffect(() => {
		if (isUserAsked) {
			isUserAsked = false;
			setText("");
			myClient
				.textRequest(text)
				.then(a => {
					addAiMessage(a.data);
					speek(a.data);
				})
				.catch(err => {
					debugger;
				});
		}
	}, [messages]);

	const addAiMessage = (message: DialogflowResponse): void => {
		const newMessage = [...cloneDeep(messages as IMessage[]), { ...message, type: MessageType.AI }];
		setMessages(newMessage);
	};
	const addUserMessage = (message: string): void => {
		const uMessage: USERMessage = { text: message, type: MessageType.USER };
		const newMessage = [...cloneDeep(messages as IMessage[]), uMessage];
		setMessages(newMessage);
	};

	const onSubmitChat = (): void => {
		isUserAsked = true;
		addUserMessage(text);
	};

	const onInvokeChat = (text: string): void => {
		const isValidText = text && !!text.length;
		if (isValidText) {
			setText(text);
			isUserAsked = true;
			addUserMessage(text);
		}
	};

	const start = () => {
		myClient.stream.startListening();
	};
	const stop = () => {
		myClient.stream
			.stopListening()
			.then(onInvokeChat)
			.catch(console.error);
	};

	const saveFile = (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.innerHTML = "Click me";
		link.download = "true";
		document.body.appendChild(link);
	};

	const renderChatbot = (): React.ReactNode => {
		return (
			<div className="chat">
				<div className="chat__header"></div>
				<div className="chat__body">
					<Messages messages={messages} />
					<button onClick={start}>Start</button>
					<button onClick={stop}>End</button>
				</div>
				<div className="chat__footer">
					<div className="chat__control">
						<input
							type="text"
							value={text}
							className="chat__input"
							placeholder="Type here..."
							onChange={e => setText(e.currentTarget.value)}
							onKeyPress={e => onPressEnter(e, onSubmitChat)}
						/>
						<button className="chat__control-btn" onClick={onSubmitChat}>
							<MatIcon type="send" />
						</button>
					</div>
				</div>
			</div>
		);
	};

	const renderLayout = (chatbot: Function): React.ReactNode => {
		return (
			<div className="clayout">
				<div className="clayout__content">{chatbot()}</div>
			</div>
		);
	};

	return <>{renderLayout(renderChatbot)}</>;
};

function speek(res: DialogflowResponse) {
	myClient.tts(res.queryResult.fulfillmentText).then(res => {
		playAudio(`data:audio/mp3;base64,${res.data.audioContent}`);
	});
}

function playAudio(src: string) {
	const player = new Audio(src);
	player.play();
}
