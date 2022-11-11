import { initializeWebServer } from './app';

const main = async () => {
	await initializeWebServer();
};

main()
	.then(() => {
		console.log('The app has started successfully');
	})
	.catch((error) => {
		console.log('Error occured during startup', error);
	});
