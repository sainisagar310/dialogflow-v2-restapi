import { IBasicCard } from "@app/chatbot/components/message/google-assistant-types";

export interface DialogflowResponse {
	responseId: string;
	queryResult: DialogflowQueryResult;
}

export interface DialogflowQueryResult {
	action: string;
	allRequiredParamsPresent: boolean;
	fulfillmentMessages: FulfillmentMessages[];
	fulfillmentText: string;
	intent: DialogflowIntent;
	parameters: any;
	queryText: string;
}

export interface FulfillmentMessages {
	platform: string;
	basicCard?: IBasicCard;
}

export interface DialogflowIntent {
	displayName: string;
	name: string;
	intentDetectionConfidence: number;
	languageCode: string;
}

export interface TTSResponse {
	audioContent: string;
}
