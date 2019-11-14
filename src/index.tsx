import React from "react";
import ReactDOM from "react-dom";
import { Chatbot } from "./chatbot/chatbot";
import "./index.scss";
import { IntentBuilder } from "./intent-builder/intent-builder";

ReactDOM.render(<IntentBuilder />, document.getElementById("root"));
