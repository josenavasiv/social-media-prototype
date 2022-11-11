import { Context } from '../types';

export const Query = {
	hello: (_parent: any, _args: any, _context: Context) => {
		return 'Hello World';
	},
	posts: async (_parent: any, _args: any, { prisma }: Context) => {
		const posts = await prisma.post.findMany({
			orderBy: [
				{
					updatedAt: 'desc',
				},
			],
		});
		return posts;
	},
	post: async (_parent: any, args: { id: string }, { prisma }: Context) => {
		const post = await prisma.post.findUnique({
			where: {
				id: Number(args.id),
			},
		});
		return post;
	},
	me: async (_parent: any, _args: any, { req, prisma }: Context) => {
		// user is not logged in
		if (!req.session.userId) {
			return null;
		}

		const user = await prisma.user.findUnique({
			where: {
				id: req.session.userId,
			},
		});

		return user;
	},
};
