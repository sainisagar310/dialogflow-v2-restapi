import React from "react";
import ReactDOM from "react-dom";
import { Chatbot } from "./chatbot/chatbot";
import "./index.scss";
import { IntentBuilder } from "./intent-builder/intent-builder";
import { Routes } from "./router/router";

ReactDOM.render(<Routes />, document.getElementById("root"));
