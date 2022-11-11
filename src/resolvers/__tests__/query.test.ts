import resolvers from '../index';
import typeDefs from '../../schema';
import { describe, expect, it } from '@jest/globals';
import { ApolloServer } from '@apollo/server';
import { Context } from 'src/types';

const server: ApolloServer<Context> = new ApolloServer<Context>({
	typeDefs,
	resolvers,
});

describe('Query Resolvers', () => {
	it('hello resolver returns Hello World', async () => {
		const helloQuery = `
			query {
				hello
			}
		`;

		const response = await server.executeOperation({
			query: helloQuery,
		});

		// @ts-ignore
		expect(response.body.singleResult.errors).toBeUndefined();
		// @ts-ignore
		expect(response.body.singleResult.data.hello).toBe('Hello World');
	});
});
