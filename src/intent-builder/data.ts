import { IntentModel, DialogModel, DialogFlowModel, NodeType } from "./intent-builder.interface";
import { IOptional } from "@app/utills/types";

export type DialogFlowTreeModel = IOptional<DialogFlowModel> & IOptional<DialogModel> & IOptional<IntentModel>;

export const StaticData: DialogFlowTreeModel[] = [
	{
		Id: "53274C53-5150-4630-9BCF-8AB92649B685",
		Name: "Marvin Sleeps",
		Description: "Marvin sleeps talk mode",
		type: NodeType.DialogFlow
	}
	// {
	// 	Id: "E466FD9E-9A02-4311-BB35-2A9D37682AC9",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Okay, let's wake him up!  Can you say, 'Wake up, Marvin!'?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "C409017F-00B8-483D-A24E-2F448CE57846",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Yes! Marvin is in bed sleeping! Do you think it is time for him to wake up?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "4B3CF72A-805C-437D-953E-4549A7D7B8AE",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Look at Marvin!  What is he doing?",
	// 	IsHead: true,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "60AB0F37-30CF-414F-85D5-4DBECB2E3FA8",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "D.2) Okay, let's let him sleep.  Can you whisper, 'Shhh'?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "1DB120B2-D684-451F-B5C5-A1383E78F5B9",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Yes!  Marvin is sleeping!  Do you think it is time for him to wake up?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "1F3B059F-F1AB-44FD-9DCD-A947C9F222BD",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Look, you woke him up! He needs to eat breakfast and comb his hair. What should he do first?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },
	// {
	// 	Id: "EB31D5FC-DE7F-4932-B5B8-FAC5105985B3",
	// 	DialogFlowId: "53274C53-5150-4630-9BCF-8AB92649B685",
	// 	Value: "Yes!  Marvin looks tired.  He is sleeping. Do you think it is time for him to wake up?",
	// 	IsHead: false,
	// 	type: NodeType.Dialog
	// },

	// {
	// 	Id: "9C137FB5-EAB4-448D-B9A2-19D268650347",
	// 	DialogId: "C409017F-00B8-483D-A24E-2F448CE57846",
	// 	Value: "Yes",
	// 	NextDialogId: "E466FD9E-9A02-4311-BB35-2A9D37682AC9",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "D39636D2-2717-41E0-AD7B-25D4278BB9EB",
	// 	DialogId: "EB31D5FC-DE7F-4932-B5B8-FAC5105985B3",
	// 	Value: "Yes",
	// 	NextDialogId: "E466FD9E-9A02-4311-BB35-2A9D37682AC9",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "4C13C36E-D353-44B3-9207-556E64119C00",
	// 	DialogId: "1DB120B2-D684-451F-B5C5-A1383E78F5B9",
	// 	Value: "Yes",
	// 	NextDialogId: "E466FD9E-9A02-4311-BB35-2A9D37682AC9",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "BC479769-7422-4AD3-84F6-6D9C87E5DB82",
	// 	DialogId: "4B3CF72A-805C-437D-953E-4549A7D7B8AE",
	// 	Value: "Bed",
	// 	NextDialogId: "C409017F-00B8-483D-A24E-2F448CE57846",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "AE811F78-FDA8-407B-BF36-70FDB42AEF85",
	// 	DialogId: "C409017F-00B8-483D-A24E-2F448CE57846",
	// 	Value: "No",
	// 	NextDialogId: "60AB0F37-30CF-414F-85D5-4DBECB2E3FA8",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "414A81F1-1036-4276-9655-71AE70AA364A",
	// 	DialogId: "4B3CF72A-805C-437D-953E-4549A7D7B8AE",
	// 	Value: "Sleeping",
	// 	NextDialogId: "1DB120B2-D684-451F-B5C5-A1383E78F5B9",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "1131A29F-C3E1-4FF0-9E8F-88D753367ABD",
	// 	DialogId: "EB31D5FC-DE7F-4932-B5B8-FAC5105985B3",
	// 	Value: "No",
	// 	NextDialogId: "60AB0F37-30CF-414F-85D5-4DBECB2E3FA8",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "EE9C57D7-51F0-4CC0-98D0-93E97E99544D",
	// 	DialogId: "E466FD9E-9A02-4311-BB35-2A9D37682AC9",
	// 	Value: "Wake Up",
	// 	NextDialogId: "1F3B059F-F1AB-44FD-9DCD-A947C9F222BD",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "0ED210CC-1D28-45C0-B8F2-BA5F6BD5BA56",
	// 	DialogId: "1DB120B2-D684-451F-B5C5-A1383E78F5B9",
	// 	Value: "No",
	// 	NextDialogId: "60AB0F37-30CF-414F-85D5-4DBECB2E3FA8",
	// 	type: NodeType.Intent
	// },
	// {
	// 	Id: "1E0839FF-EE45-45DE-9BD9-C84F375C522D",
	// 	DialogId: "4B3CF72A-805C-437D-953E-4549A7D7B8AE",
	// 	Value: "Tired",
	// 	NextDialogId: "EB31D5FC-DE7F-4932-B5B8-FAC5105985B3",
	// 	type: NodeType.Intent
	// }
];
