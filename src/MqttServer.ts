
import * as aedes from 'aedes';
import * as net from 'net';
import { ISubscription, IPublishPacket } from 'mqtt-packet';
import * as log from 'loglevel';
import { UserAuthenticator } from './UserAuthenticator';

const util = require('util');

export abstract class MqttServer {

	static PORT = 1883;
	private static COMMAND_PUBLISH = 'publish';
	private static QOS_EXACTLY_ONCE = 2;
	private static BAD_USERNAME_OR_PASSWORD = 4;

	aedes: aedes.Aedes;
	server?: net.Server = undefined;

	constructor(userAuthenticator?: UserAuthenticator) {
		this.aedes = aedes.Server({
			authenticate: MqttServer.createAuthenicationHandler(userAuthenticator)
		});
		this.aedes.on('publish', (packet: IPublishPacket, client: aedes.Client) => {
			if (client !== null) {  // is null if the this server sent the message
				this.onMessageReceived(packet.topic, packet.payload.toString());
			}
		});
		this.aedes.on('subscribe', (subscriptions: ISubscription[]) => {
			const topics = subscriptions.map(subscription => subscription.topic);
			topics.forEach(topic => this.onSubscribe(topic));
		});
		this.aedes.on('unsubscribe', (topics: string[]) => {
			topics.forEach(topic => this.onUnsubscribe(topic));
		});
	}

	async start() {
		this.server = net.createServer(this.aedes.handle);
		await util.promisify((callback: any) => this.server!.listen(MqttServer.PORT, callback))();
		log.info('Server listening on port ' + MqttServer.PORT);
	}

	async stop() {
		if (!this.aedes.closed) {
			const closeAedes = util.promisify((callback: any) => this.aedes.close(callback))();
			const closeServer = util.promisify((callback: any) => this.server!.close(callback))();
			await Promise.all([closeAedes, closeServer]);
			log.info('Server stopped');
		}
	}

	publish(topic: string, payload: string) {
		const packet: aedes.PublishPacket = {
			topic,
			payload,
			cmd: MqttServer.COMMAND_PUBLISH as any,
			qos: MqttServer.QOS_EXACTLY_ONCE as any,
			dup: false,
			retain: false,
		}
		this.aedes.publish(packet, (error?: Error) => {
			if (error) {
				log.info(`Publish error: ${error}`);
			}
		});
	}

	private static createAuthenicationHandler(userAuthenticator?: UserAuthenticator) {
		return (_: aedes.Client, username: string, password: Buffer, done: (error: aedes.AuthenticateError | null, success: boolean | null) => void) => {
			const authenticationRequired = (userAuthenticator !== undefined);
			const hasAuthentication = (username !== undefined) && (password !== undefined);
			if (!authenticationRequired || (hasAuthentication && userAuthenticator!.isValidAuthentication(username, password.toString()))) {
				done(null, true);
			} else {
				const error: aedes.AuthenticateError = Object.assign(new Error(), { returnCode: MqttServer.BAD_USERNAME_OR_PASSWORD});
				done(error, false);
			}
		}
	}

	abstract onMessageReceived(topic: string, payload: string): void

	abstract onSubscribe(topics: string): void

	abstract onUnsubscribe(topics: string): void

}