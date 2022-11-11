import { initializeWebServer, stopWebServer } from '../../app';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

let axiosAPIClient: AxiosInstance;

beforeAll(async () => {
	await initializeWebServer();
	const axiosConfig = {
		baseURL: `http://127.0.0.1:${process.env.PORT}`, // 127.0.0.1 -> localhost
		validateStatus: () => true,
	};
	axiosAPIClient = axios.create(axiosConfig);
});

afterAll(async () => {
	await stopWebServer();
});

describe('Mutation Resolvers', () => {
	it('postCreate resolver succeeds', async () => {
		const postCreateMutation = `mutation postCreate($title: String!, $text: String!) {
			postCreate(title: $title, text: $text) {
			  text
			  title
			}
		  }`;

		const body = {
			query: postCreateMutation,
			variables: {
				title: 'TITLE',
				text: 'TEXT',
			},
		};

		const mock_data = {
			text: 'TEXT',
			title: 'TITLE',
		};

		const response = await axiosAPIClient.post('/graphql', body);
		console.log(response.data);
		expect(response.data.data.postCreate).toMatchObject(mock_data);
	});
});
