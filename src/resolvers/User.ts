import { Context } from '../types';

interface UserParentType {
	id: number; // Refers to the user id of the User (Prisma Schema)
	email: string;
}

export const User = {
	posts: async ({ id }: UserParentType, _args: any, { prisma }: Context) => {
		// const isOwnProfile = req.session.userId === id; If we were to have published or unpublished posts - The logged-in user would be able to see their own unpublished posts

		const posts = await prisma.post.findMany({
			where: {
				creatorId: id,
			},
			orderBy: [{ createdAt: 'desc' }],
		});

		return posts;
	},
	updoots: async ({ id }: UserParentType, _args: any, { prisma }: Context) => {
		const updoots = await prisma.updoot.findMany({
			where: {
				userId: id,
			},
		});

		return updoots;
	},
};
