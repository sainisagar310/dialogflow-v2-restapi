export interface IBase {
	id: string;
}

export interface DialogFlowModel extends IBase {
	name: string;
	value: string;
	description: string;
	unit?: number;
	order?: number;
	type: NodeType;
}

export interface DialogModel extends IBase {
	value: string;
	imageUrl?: string;
	order?: number;
	retryCount?: number;
	isHead: boolean;
	type: NodeType;
}

export interface IntentModel extends IBase {
	dialogId: string;
	value: string;
	nextDialogId: string;
	order?: number;
	type: NodeType;
	imageUrl: string;
	utterances: UtteranceModel[];
}

export interface UtteranceModel extends IBase {
	value: string;
}

export enum NodeType {
	DialogFlow = 0,
	Dialog = 1,
	Intent = 2
}
