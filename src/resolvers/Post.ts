import { Context } from '../types';

interface PostParentType {
	creatorId: number; // From prisma schema
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
};
