import { RecordRTCPromisesHandler } from "recordrtc";
import { encode } from "base64-arraybuffer";
import Axios, { AxiosResponse } from "axios";

export class DialogflowStream {
	private recorder: RecordRTCPromisesHandler;
	private sttEndpoint = "https://speech.googleapis.com/v1/speech:recognize";

	constructor(private readonly token: string) {
		this.init();
	}

	private async init() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.recorder = new RecordRTCPromisesHandler(stream, { type: "audio", mimeType: "audio/wav", sampleRate: 16000, desiredSampRate: 16000, frameRate: 16 });
	}

	startListening() {
		return this.recorder.startRecording();
	}

	async stopListening(): Promise<string> {
		await this.recorder.stopRecording();
		const data = await this.recorder.getBlob();
		return await this.blobToText(data);
		// return Promise.resolve(data);
	}

	async blobToText(blob: Blob): Promise<string> {
		const arrayBuffer = await this.blobToArrayBuffer(blob);
		const decodedBuffer = await decodeArrayBuffer(arrayBuffer);
		const base64 = encode(decodedBuffer);
		const result = await this.stt(base64);
		const resultData = result.data;
		if (resultData && resultData.results && resultData.results[0]) {
			return Promise.resolve(resultData.results[0].alternatives[0].transcript);
		}
		return Promise.resolve("");
	}

	private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = e => {
				resolve(e.target.result as ArrayBuffer);
			};
			reader.onerror = reject;
			reader.readAsArrayBuffer(blob);
		});
	}
	private stt(content: string): Promise<AxiosResponse<any>> {
		return Axios.post(
			this.sttEndpoint,
			{
				audio: {
					content
				},
				config: {
					encoding: "LINEAR16",
					languageCode: "en-US",
					sampleRateHertz: 48000
				}
			},
			{ headers: { Authorization: this.token } }
		);
	}

	saveFile(): void {
		this.recorder.save("aaaa");
	}
}

function decodeArrayBuffer(buffer: ArrayBuffer): Promise<ArrayBuffer> {
	var that = {
			audioContext: new AudioContext(),
			channelRecognitionEnabled: null,
			channelCount: null,
			diarizationCount: 1,
			audioDuration: null,
			diarizationEnabled: true,
			audioDurationLimit: 59,
			errorClient: null,
			fileUploadStatus: null,
			sampleRate: 16000
		},
		buffer = buffer.slice(0);
	return new Promise(function(resolve, reject) {
		that.audioContext.decodeAudioData(
			buffer,
			function(decodedData) {
				var channels: any = decodedData.numberOfChannels;
				var rChannels = that.channelRecognitionEnabled ? channels : 1;
				var offlineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
				that.channelCount = channels;
				that.channelRecognitionEnabled ? (that.diarizationCount = channels) : that.diarizationEnabled || (that.diarizationCount = 1);

				/** Duration Check */
				if (decodedData.duration > that.audioDurationLimit) {
					return (that.errorClient = "AUDIO_LENGTH"), reject();
				}

				that.audioDuration = decodedData.duration;
				that.fileUploadStatus = "CONVERTING";

				// if (!offlineAudioContext) {
				// 	decodedData = "separate" === that.diarizationOptionSelected || "off" === that.diarizationOptionSelected;

				// 	/** if nothing is found in audio */
				// 	if (1 < channels && !decodedData) {
				// 		return (that.errorClient = "MULTI_CHANNEL"), reject();
				// 	}

				// 	that.channelRecognitionEnabled = !0;
				// 	that.diarizationOptionSelected = "separate";

				// 	return resolve(buffer);
				// }

				that.sampleRate = decodedData.sampleRate;
				var offlineAC = new OfflineAudioContext(rChannels, decodedData.length, decodedData.sampleRate);
				var channels = offlineAC.createBufferSource() as any;
				rChannels = channels;
				channels.buffer = decodedData;
				that.channelRecognitionEnabled || ((rChannels = offlineAC.createChannelMerger(1)), channels.connect(rChannels));
				rChannels.connect(offlineAC.destination);
				channels.start();
				decodedData = offlineAC.startRendering() as any;
				Promise.resolve(decodedData)
					.then(function(q) {
						if (q) {
							resolve(jj(q, {}));
						} else {
							offlineAC.oncomplete = function(t) {
								resolve(jj(t.renderedBuffer, {}));
							};
						}
					})
					.catch(function(q) {
						reject(q);
					});
			},
			function(g) {
				reject(g);
			}
		);
	});
}

function jj(a, b) {
	b = b || {};
	var d = a.numberOfChannels,
		e = a.sampleRate,
		f = b.float32 ? 3 : 1,
		g: DataView | Number = 3 === f ? 32 : 16;
	if (2 === d) {
		b = a.getChannelData(0);
		a = a.getChannelData(1);
		for (var h = b.length + a.length, float32Array: Float32Array | number = new Float32Array(h), dataView: DataView | number = 0, p = 0; dataView < h; )
			(float32Array[dataView++] = b[p]), (float32Array[dataView++] = a[p]), p++;
		b = float32Array;
	} else b = a.getChannelData(0);
	a = d;
	h = (g as number) / 8;
	float32Array = a * h;
	d = new ArrayBuffer(44 + b.length * h);
	dataView = new DataView(d);
	kj(dataView, 0, "RIFF");
	dataView.setUint32(4, 36 + b.length * h, !0);
	kj(dataView, 8, "WAVE");
	kj(dataView, 12, "fmt ");
	dataView.setUint32(16, 16, !0);
	dataView.setUint16(20, f, !0);
	dataView.setUint16(22, a, !0);
	dataView.setUint32(24, e, !0);
	dataView.setUint32(28, (e * float32Array) as number, !0);
	dataView.setUint16(32, float32Array as number, !0);
	dataView.setUint16(34, g as number, !0);
	kj(dataView, 36, "data");
	dataView.setUint32(40, b.length * h, !0);
	if (1 === f) for (g = dataView, e = 44, f = 0; f < b.length; f++, e += 2) (a = Math.max(-1, Math.min(1, b[f]))), g.setInt16(e, 0 > a ? 32768 * a : 32767 * a, !0);
	else for (g = dataView, e = 44, f = 0; f < b.length; f++, e += 4) g.setFloat32(e, b[f], !0);
	return d;
}
function kj(a, b, d) {
	for (var e = 0; e < d.length; e++) a.setUint8(b + e, d.charCodeAt(e));
}
