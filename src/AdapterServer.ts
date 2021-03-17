import { SubscribeMessageMetadata, PublishMessageMetadata } from './MessageMetadata';
import { MqttServer } from './MqttServer';
import { NetworkNode } from './NetworkNode';
import { UserAuthenticator } from './UserAuthenticator';
import * as log from 'loglevel';

export class AdapterServer extends MqttServer {

	networkNode: NetworkNode;
	streamIdDomain?: string;

	constructor(networkNode: NetworkNode, userAuthenticator?: UserAuthenticator, streamIdDomain?: string) {
		super(userAuthenticator);
		this.networkNode = networkNode;
		this.streamIdDomain = streamIdDomain
	}

	onMessageReceived(topic: string, payload: string) {
		const { message, metadata } = JSON.parse(payload);
		this.networkNode.publish(this.getStreamId(topic), message, metadata);
	}

	onSubscribe(topic: string) {
		log.info('Client subscribed: ' + topic);
		this.networkNode.subscribe(this.getStreamId(topic), (message: any, metadata: SubscribeMessageMetadata) => {
			const payload = JSON.stringify({
				message,
				metadata: {
					timestamp: metadata.timestamp
				}
			});
			this.publish(topic, payload);
		});
	}

	onUnsubscribe(topic: string) {
		log.info('Client unsubscribed: ' + topic);
		this.networkNode.unsubscribe(this.getStreamId(topic));
	}

	getStreamId(topic: string) {
		if (this.streamIdDomain !== undefined) {
			return this.streamIdDomain + '/' + topic;
		} else {
			return topic;
		}
	}

	async stop() {
		await super.stop();
		await this.networkNode.stop();
	}

}