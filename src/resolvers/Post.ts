import { Context } from '../types';

interface PostParentType {
	creatorId: number; // From prisma schema
	id: number;
}

export const Post = {
	user: async ({ creatorId }: PostParentType, _args: any, { prisma }: Context) => {
		const user = await prisma.user.findUnique({
			where: {
				id: creatorId,
			},
		});

		return user;
	},
	updoots: async ({ id }: PostParentType, _args: any, { prisma }: Context) => {
		const updoots = await prisma.updoot.findMany({
			where: {
				postId: id,
			},
		});

		return updoots;
	},
};
