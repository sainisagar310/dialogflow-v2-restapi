export interface IBasicCard {
	subtitle: string;
	title: string;
	formattedText: string;
	image: IImage;
	buttons: IButton[];
}

export interface IImage {
	imageUri: string;
	accessibilityText: string;
}
export interface IButton {
	openUrlAction: {
		url: string;
	};
	title: string;
}
