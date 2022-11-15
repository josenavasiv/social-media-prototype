require('ts-node/register');
require('ts-node').register({
	transpileOnly: true,
});

import isPortReachable from 'is-port-reachable';

const setup = async (): Promise<void> => {
	console.log('GLOBAL SETUP RUNNNNNNNNNNNNN!');
	await isPortReachable(5433, { host: 'localhost' });
};

export default setup;

// Fails when importing modules
