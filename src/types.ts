import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

// req.session type
declare module 'express-session' {
	interface SessionData {
		userId: number;
	}
}

export interface Context {
	req: Request;
	res: Response;
	prisma: PrismaClient<
		Prisma.PrismaClientOptions,
		never,
		Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
	>;
	redis: Redis;
}
