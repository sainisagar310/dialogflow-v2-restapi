import { DialogFlowTreeNode } from "@app/intent-builder/data";
import { NodeType, DialogFlowModel, DialogModel, IntentModel } from "@app/intent-builder/intent-builder.interface";
import { CreateIntentRequestModel, TrainingPhrase, CreateIntentResponseModel } from "./dialogflow-conversion.intentface";
import Axios from "axios";

export class DialogflowConversion {
	private readonly projectId: string = "080554cb-19d6-48a0-9aae-e833c6025f7b";
	private readonly endpoints = {
		intentCreate: `https://dialogflow.googleapis.com/v2/projects/grapeseed-teacher/agent/intents`
	};
	private token: string = "Bearer ya29.c.Kl6zB37MZQZ0nCNR1Xdp0dTUcfFUKp9CztPESXtQQ81leWHdEphSXKcxe-226nb8wSkDrPtkLHgM0LsVPJ9nZJ7QhcvYL3tu05tme0mub2tm7irMzfe_uKvzjwU6oNaP";
	private readonly intents: CreateIntentRequestModel[] = [];
	constructor(private readonly nodes: DialogFlowTreeNode[]) {}

	private init() {
		const dialogflow = this.nodes.find(n => n.type === NodeType.DialogFlow) as DialogFlowModel;
		const entryDialog = this.nodes.find(n => n.type === NodeType.Dialog && n.isHead) as DialogModel;
		const intents = this.nodes.filter(n => n.type === NodeType.Intent) as IntentModel[];
		this.buildRootIntent(dialogflow, entryDialog);
		intents.forEach(i => this.buildIntent(i, entryDialog));
	}

	private buildRootIntent(dialogflow: DialogFlowModel, entryDialog: DialogModel): void {
		const intent: CreateIntentRequestModel = {
			_originalId: entryDialog.id,
			displayName: dialogflow.value,
			trainingPhrases: [
				{
					parts: [
						{
							text: `${dialogflow.id}-init`
						}
					]
				}
			],
			messages: [
				{
					text: {
						text: entryDialog.value
					}
				}
			],
			inputContextNames: [],
			outputContexts: [
				{
					name: this.__generateContext(entryDialog),
					lifespanCount: 2
				}
			]
		};
		this.intents.push(intent);
	}

	private buildIntent(intent: IntentModel, entryDialog: DialogModel): void {
		const parentDialog = this.nodes.find(n => n.type === NodeType.Dialog && intent.dialogId === n.id) as DialogModel;
		const childDialog = this.nodes.find(n => n.type === NodeType.Dialog && n.id === intent.nextDialogId);
		const d: CreateIntentRequestModel = {
			_originalId: childDialog.id,
			displayName: `${parentDialog.id} - ${intent.value}`,
			trainingPhrases: !!intent.utterances.length ? intent.utterances.map<TrainingPhrase>(u => ({ parts: [{ text: u.value }] })) : [{ parts: [{ text: intent.value }] }],
			messages: [{ text: { text: childDialog.value } }],
			rootFollowupIntentName: this.__getFollowupName(entryDialog),
			parentFollowupIntentName: this.__getFollowupName(parentDialog),
			inputContextNames: [this.__generateContext(parentDialog)],
			outputContexts: [
				{
					name: this.__generateContext(childDialog),
					lifespanCount: 2
				}
			]
		};
		this.intents.push(d);
	}

	private __getFollowupName(node: DialogFlowTreeNode): string {
		return `projects/${this.projectId}/agent/intents/NOTSET__${node.id}`;
	}

	private __generateContext(node: DialogFlowTreeNode): string {
		return `projects/${this.projectId}/agent/sessions/-/contexts/${node.id}__followup`;
	}

	private __extractIntentId(name: string): string {
		const splited = name.split("/");
		return splited[splited.length - 1];
	}

	private postIntent(intent: CreateIntentRequestModel) {
		const { _originalId, _uploaded, ...rest } = intent;
		return Axios.post<CreateIntentResponseModel>(this.endpoints.intentCreate, rest, { headers: { Authorization: this.token } });
	}

	private updateIntentId(name: string, intentId: string, originalIntentId: string) {
		const splitedName = name.split(/(NOTSET__)/g);
		const lastIndex = splitedName.length - 1;
		if (splitedName[lastIndex] === originalIntentId) {
			splitedName[lastIndex - 1] = "";
			splitedName[lastIndex] = intentId;
		}
		return splitedName.join("");
	}

	private updateDataSet(intent: CreateIntentRequestModel, response: CreateIntentResponseModel): void {
		const intentId = this.__extractIntentId(response.name);
		const originalIntentId = intent._originalId;
		this.intents.forEach((i, index) => {
			if (!i._uploaded) {
				const { rootFollowupIntentName, parentFollowupIntentName } = i;
				if (!!rootFollowupIntentName) {
					this.intents[index].rootFollowupIntentName = this.updateIntentId(rootFollowupIntentName, intentId, originalIntentId);
				}
				if (!!parentFollowupIntentName) {
					this.intents[index].parentFollowupIntentName = this.updateIntentId(parentFollowupIntentName, intentId, originalIntentId);
				}
			}
		});
	}

	public convert(): CreateIntentRequestModel[] {
		this.init();
		return this.intents;
	}

	public build(): void {
		const index = this.intents.findIndex(i => {
			const { parentFollowupIntentName, rootFollowupIntentName, _uploaded } = i;
			if (_uploaded) {
				return false;
			}
			if (!!rootFollowupIntentName) {
				const noValue = rootFollowupIntentName.split("NOTSET__").length > 1;
				if (noValue) {
					return false;
				}
			}
			if (!!parentFollowupIntentName) {
				const noValue = parentFollowupIntentName.split("NOTSET__").length > 1;
				if (noValue) {
					return false;
				}
			}
			return true;
		});
		if (index !== -1) {
			const intent = this.intents[index];
			this.postIntent(intent)
				.then(({ data }) => {
					this.intents[index]._uploaded = true;
					this.updateDataSet(intent, data);
					this.build();
				})
				.catch(console.error);
		} else {
			console.log("Build Success...");
		}
	}
}
