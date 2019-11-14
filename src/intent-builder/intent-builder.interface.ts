// export interface IntentsData {
// 	id: number;
// 	name: string;
// 	parent: number;
// 	parents?: number[];
// }

// export interface DialogflowIntent {
// 	id: string;
// 	name: string;
// 	auto: boolean;
// 	contexts: string[];
// 	userSays: DialogflowIntentUtterance[];
// 	responses: DialogflowIntentResponse[];
// 	priority: number;
// 	webhookUsed: boolean;
// 	webhookForSlotFilling: boolean;
// 	fallbackIntent: boolean;
// 	events: string[];
// 	conditionalResponses: any[];
// 	condition: string;
// 	conditionalFollowupEvents: any[];
// }

// export interface DialogflowIntentResponse {
// 	resetContexts: boolean;
// 	action: string;
// 	affectedContexts: string[];
// 	parameters: string[];
// 	messages: DialogflowIntentMessage[];
// 	defaultResponsePlatforms: any;
// 	speech: any[];
// }

// export interface DialogflowIntentMessage {
// 	type: number;
// 	lang: string;
// 	condition: string;
// 	speech: string;
// }

// export interface DialogflowIntentUtterance {
// 	id: string;
// 	data: [
// 		{
// 			text: string;
// 			userDefined: boolean;
// 		}
// 	];
// 	isTemplate: boolean;
// 	count: number;
// 	updated: number;
// 	isAuto: boolean;
// }

interface IBase {
	Id: string;
	CreatedBy?: string;
	CreationDate?: Date;
	UpdatedBy?: string;
	UpdatedDate?: Date;
}

export interface DialogFlowModel extends IBase {
	Name: string;
	Description: string;
	Unit?: number;
	Order?: number;
	type: NodeType;
}

export interface DialogModel extends IBase {
	DialogFlowId: string;
	Value: string;
	ImageUrl?: string;
	Order?: number;
	RetryCount?: number;
	IsHead: boolean;
	type: NodeType;
}

export interface IntentModel extends IBase {
	DialogId: string;
	Value: string;
	NextDialogId: string;
	Order?: number;
	type: NodeType;
}

export enum NodeType {
	DialogFlow = 0,
	Dialog = 1,
	Intent = 2
}
