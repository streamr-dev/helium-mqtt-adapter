import { AdapterServer } from './AdapterServer';
import { NetworkNode } from './NetworkNode';
import { UserAuthenticator } from './UserAuthenticator';
import * as dotenv from 'dotenv';
import * as log from 'loglevel';

dotenv.config();
log.setLevel(log.levels.INFO);

const networkNode = new NetworkNode​​(process.env.PRIVATE_KEY as string);
const server = new AdapterServer(networkNode, UserAuthenticator.fromConfig(), process.env.STREAM_ID_DOMAIN as string);
server.start();

process.on('SIGINT', () => {
	server.stop();
});