import express from 'express';
import http from 'http';
import cors from 'cors';
import { __prod__, COOKIE_NAME } from './constants';
import { json } from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';

// Prisma Client Instance -> Connects to PostreSQL Server
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// Redis Client Instance -> Connects to Redis Server
import session from 'express-session';
import Redis from 'ioredis';
const RedisStore = require('connect-redis')(session);
const redis = new Redis(); // Need to provide process.env

// Apollo Server Schema
import typeDefs from './schema';
import resolvers from './resolvers';
import { Context } from './types';

let connection: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

// Instantiates the express server app + middleware, apollo server, a redis instance + connection
export const initializeWebServer = async () => {
	const app = express();
	const httpServer = http.createServer(app);
	const apolloServer = new ApolloServer<Context>({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await apolloServer.start();
	await redis.connect().catch((error) => console.log(error)); // Connects to localhost:6379 by default

	app.set('trust proxy', true);
	// Providing middleware for the Express App - MIDDLEWARE RUNS IN SPECIFIED ORDER
	app.use(
		'/graphql',
		json(),
		bodyParser.urlencoded({ extended: false }),
		cors<cors.CorsRequest>({
			origin: 'http://localhost:3000',
			credentials: true,
		}),
		session({
			name: COOKIE_NAME,
			store: new RedisStore({ client: redis, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // Max Age of the Cookie in ms
				httpOnly: true, // Prevents accessing cooking via the browser
				secure: __prod__, // cookie only work in https (false in development|testing mode)
				sameSite: 'lax', // csrf
			},
			saveUninitialized: false, // Creates a session by default
			secret: process.env.REDIS_SECRET as string,
			resave: false,
		}),
		expressMiddleware(apolloServer, {
			// Provides the express app the endpoint '/graphql/' and points to the Graphql server
			context: async ({ req, res }) => ({ req, res, prisma, redis }),
		})
	);

	connection = httpServer.listen({ port: 4000 }, () => {
		console.log(`???? Server ready at http://localhost:4000/graphql`);
	});

	return {
		connection,
		httpServer,
		apolloServer,
		redisClient: redis,
	};
};

export const stopWebServer = async () => {
	connection.close();
	await prisma.$disconnect();
	redis.disconnect();
};
