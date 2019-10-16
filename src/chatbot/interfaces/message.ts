import { IServerResponse } from "api-ai-javascript/ts/Interfaces";
import { DialogflowResponse } from "@app/dialogflow-sdk/response.interface";

export interface AIMessage extends DialogflowResponse {
	type: MessageType;
}
export interface USERMessage {
	type: MessageType;
	text: string;
}

export type IMessage = AIMessage | USERMessage;
export type IMessages = (AIMessage | USERMessage)[];

export enum MessageType {
	AI = 0,
	USER = 1
}
