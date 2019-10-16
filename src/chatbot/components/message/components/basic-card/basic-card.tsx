import React from "react";
import { IBasicCard } from "../../google-assistant-types";

interface BasicCardComponentProps extends IBasicCard {}
export const BasicCardComponent: React.FC<BasicCardComponentProps> = props => {
	const { image } = props;
	return <img src={image.imageUri} alt={image.accessibilityText} />;
};
