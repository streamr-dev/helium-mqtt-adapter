import { SubscribeMessageMetadata, PublishMessageMetadata } from './MessageMetadata';
import * as log from 'loglevel';

const StreamrClient = require('streamr-client');

export class NetworkNode {

	static WS_URL = 'ws://localhost/api/v1/ws';
	static REST_URL = 'http://localhost/api/v1';

	streamrClient: any;
	publishStreams: Map<string,any> = new Map();
	subscriptions: Map<string,any> = new Map();

	constructor(privateKey: string) {
		this.streamrClient = new StreamrClient({
			auth: {
				privateKey: privateKey
			},
			url: NetworkNode.WS_URL,
			restUrl: NetworkNode.REST_URL,
			autoDisconnect: false
		});
	}

	async publish(streamId: string, message: any, metadata?: PublishMessageMetadata) {
		const stream = await this.getPublishStream(streamId);
		return this.streamrClient.publish(stream, message, metadata?.timestamp);
	}

	subscribe(streamId: string, onMessageReceived: (message: any, metadata: SubscribeMessageMetadata) => void) {
		const subscription = this.streamrClient.subscribe(streamId, (message: any, metadata: any) => {
			onMessageReceived(message, {
				timestamp: metadata.messageId.timestamp
			});
		});
		this.subscriptions.set(streamId, subscription);
	}

	unsubscribe(streamId: string) {
		const subscription = this.subscriptions.get(streamId);
		if (subscription !== undefined) {
			this.streamrClient.unsubscribe(subscription);
			this.subscriptions.delete(streamId);
		} else {
			log.warn('No subscription: ' + streamId);
		}
	}

	async stop() {
		await this.streamrClient.ensureDisconnected();
	}

	private async getPublishStream(streamId: string) {
		let stream = this.publishStreams.get(streamId);
		if (stream === undefined) {
			stream = await this.streamrClient.getOrCreateStream({
				id: streamId
			});
			this.publishStreams.set(streamId, stream);
		}
		return stream;
	}

}