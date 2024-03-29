import { IntentModel, DialogModel, DialogFlowModel, NodeType, IBase } from "./intent-builder.interface";
import { IOptional } from "@app/utills/types";

export type DialogFlowTreeNode = IOptional<DialogFlowModel> & IOptional<DialogModel> & IOptional<IntentModel>;

export interface DialogFlowResponse extends DialogFlowModel {
	dialogFlow: DialogFlowTreeNode[];
}
