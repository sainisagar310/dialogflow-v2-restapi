import Axios, { AxiosResponse } from "axios";
import { Endpoints } from "./endpoints";
import { DialogflowResponse, TTSResponse } from "./response.interface";
import { DialogflowStream } from "./dialogflow-stream";

export class DialogflowSDK {
	private endpointPrefix = null;
	private ttsEndpoint = "https://texttospeech.googleapis.com/v1/text:synthesize";
	private sttEndpoint = "https://speech.googleapis.com/v1/speech:recognize";
	private session: number = Math.floor(Math.random() * 1000000000);
	private token: string = "Bearer ya29.c.Kl6yBxqaA4G9mgvL_kgiDKHinBPYUkQQiPmVWmjYUca36YRj_yo5bk3TJIqdwg_nzMSuFO3TupCRsjq16tnDzzRxads2g8bWm29OhNE4k9UVSFNiLKC7fi8cw0AvU1uD";

	public stream: DialogflowStream = new DialogflowStream(this.token);

	constructor(private readonly projectId: string) {
		this.endpointPrefix = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${this.session}:`;
	}

	textRequest(query: string): Promise<AxiosResponse<DialogflowResponse>> {
		return Axios.post(
			this.endpointPrefix + Endpoints.detectIntent,
			{
				queryInput: {
					text: {
						text: query,
						languageCode: "en-IN"
					}
				}
			},
			{ headers: { Authorization: this.token } }
		);
	}

	tts(text: string): Promise<AxiosResponse<TTSResponse>> {
		return Axios.post(
			this.ttsEndpoint,
			{
				input: {
					text: text
				},
				voice: {
					languageCode: "en-US",
					name: "en-US-Wavenet-F",
					ssmlGender: "FEMALE"
				},
				audioConfig: {
					audioEncoding: "MP3"
				}
			},
			{ headers: { Authorization: this.token } }
		);
	}
}
