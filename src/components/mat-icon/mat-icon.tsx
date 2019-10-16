import * as React from "react";

interface MatIconProps extends React.Props<MatIconProps> {
	type: string;
}

export const MatIcon: React.StatelessComponent<MatIconProps> = props => {
	const { type } = props;
	return <i className="material-icons">{type}</i>;
};
