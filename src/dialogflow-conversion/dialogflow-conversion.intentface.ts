export interface CreateIntentRequestModel {
	/**
	 * Id from our database
	 */
	_originalId: string;
	_uploaded?: boolean;
	displayName: string;
	messages: CreateIntentRequestMessage[];
	trainingPhrases: TrainingPhrase[];
	rootFollowupIntentName?: string;
	parentFollowupIntentName?: string;
	inputContextNames?: string[];
	outputContexts?: OutputContext[];
}

export interface CreateIntentRequestMessage {
	text: {
		text: string;
	};
}
export interface TrainingPhrase {
	parts: Array<{
		text: string;
	}>;
}

export interface OutputContext {
	name: string;
	parameters?: any;
	lifespanCount?: number;
}

export interface CreateIntentResponseModel {
	name: string;
}
