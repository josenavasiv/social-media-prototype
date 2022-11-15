import { initializeWebServer, stopWebServer } from '../app';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
// import nock from 'nock';
import axios, { AxiosInstance } from 'axios';

let axiosAPIClient: AxiosInstance;

beforeAll(async () => {
	await initializeWebServer();
	const axiosConfig = {
		baseURL: `http://127.0.0.1:${process.env.PORT}`, // 127.0.0.1 -> localhost
		validateStatus: () => true,
	};
	axiosAPIClient = axios.create(axiosConfig);
	// nock.disableNetConnect();
	// nock.enableNetConnect('127.0.0.1');
});

// beforeEach(async () => {
// 	nock('http://localhost/user/').get(`/1`).reply(200, {
// 		id: 1,
// 		name: 'John',
// 	});
// });

// afterEach(async () => {
// 	nock.cleanAll();
// });

afterAll(async () => {
	await stopWebServer();
	// nock.enableNetConnect();
});

describe('Health Check Against Web Server', () => {
	it('/graphql', async () => {
		const helloQuery = `
			query {
				hello
			}
		`;
		const queryData = {
			query: helloQuery,
		};

		const response = await axiosAPIClient.post('/graphql', queryData);
		expect(response.data.data.hello).toBe('Hello World');
	});
});

// HERE WE TEST OUT THE ENTIRE APPLICATION AS A WHOLE (Which is an express application)
// Mega integration test (express app + prisma (sql) + redis (logging) + graphql schema and resolvers)
// Need to spin up testing postgresql + redis containers via docker-compose
// provide the docker url within the prisma env.test

// "test": "dotenv -e .env.test npm run docker:up && npx prisma migrate deploy && jest --config jest.config.js"
// This was original test script
// Change to a global startup .ts file with docker-compose
