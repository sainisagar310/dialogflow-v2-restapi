import React from "react";
import { Switch, Router, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { IntentBuilder } from "@app/intent-builder/intent-builder";
import { Chatbot } from "@app/chatbot/chatbot";

export const Paths = {
	Root: "/",
	Builder: "/builder"
};

export const Routes: React.FC<any> = () => {
	return (
		<Router history={createBrowserHistory()}>
			<Switch>
				<Route exact component={Chatbot} path={Paths.Root} />
				<Route exact component={IntentBuilder} path={Paths.Builder} />
				{/* <Redirect to="/not-found" /> */}
			</Switch>
		</Router>
	);
};
