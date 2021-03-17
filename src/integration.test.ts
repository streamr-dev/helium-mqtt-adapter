import { AdapterServer } from './AdapterServer';
import { NetworkNode } from './NetworkNode';
import { MqttServer } from './MqttServer';
import { UserAuthenticator } from './UserAuthenticator';
import * as log from 'loglevel';

const StreamrClient = require('streamr-client');
const mqtt = require('async-mqtt');

const MOCK_USERNAME = 'mock-user';
const MOCK_PASSWORD = 'mock-password';

jest.setTimeout(30000);
log.setLevel(log.levels.SILENT);

const startAdapterServer = (user: any) => {
	const networkNode = new NetworkNode(user.privateKey);
	const server = new AdapterServer(networkNode, new UserAuthenticator(MOCK_USERNAME, MOCK_PASSWORD), user.address);
	server.start();
	return server;
};

const createStreamrClient = (privateKey: string) => {
	return new StreamrClient({
		auth: {
			privateKey
		},
		url: NetworkNode.WS_URL,
		restUrl: NetworkNode.REST_URL,
		autoDisconnect: false
	});
};

const createMqttClient = () => {
	return mqtt.connectAsync('mqtt://localhost:' + MqttServer.PORT, {
		username: MOCK_USERNAME,
		password: MOCK_PASSWORD,
	});
}

let adapterServer: any;
let streamrClient: any;
let mqttClient: any;
let topic: string;

beforeEach(async () => {
	const user = StreamrClient.generateEthereumAccount();
	adapterServer = startAdapterServer(user);
	streamrClient = createStreamrClient(user.privateKey);
	mqttClient = await createMqttClient();
	topic = 'topic-' + Date.now();
	await streamrClient.createStream({
		id: adapterServer.getStreamId(topic)
	});
});

test('publish on MQTT client', done => {
	const createPayload = () => {
		const message = {
			foo: 'from-client'
		};
		return JSON.stringify({
			message
		});
	};
	const subscription = streamrClient.subscribe({
		stream: adapterServer.getStreamId(topic)
	}, (message: any) => {
		expect(message.foo).toBe('from-client');
		done();
	});
	subscription.once('subscribed', () => {
		mqttClient.publish(topic, createPayload());
	});
});

test('subscribe on MQTT client', done => {
	mqttClient.on('message', (topic: string, payload: Buffer) => {
		const json = JSON.parse(payload.toString());
		expect(topic).toBe(topic);
		expect(json.message.foo).toBe('to-client');
		expect(json.metadata.timestamp).toBeDefined();
		done()
	});
	streamrClient.publish(adapterServer.getStreamId(topic), {
		foo: 'to-client'
	});
	mqttClient.subscribe(topic);
});

afterEach(async () => {
	await mqttClient.end(true);
	await streamrClient.ensureDisconnected();
	await adapterServer.stop();
});