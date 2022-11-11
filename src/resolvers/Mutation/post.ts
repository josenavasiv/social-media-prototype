import { Context } from 'src/types';

export const postMutationResolvers = {
	postCreate: async (_parent: any, { title, text }: { title: string; text: string }, { prisma }: Context) => {
		const post = await prisma.post.create({
			data: {
				title,
				text,
				creatorId: 1, // Mocking the logged in user
			},
		});
		return post;
	},
	postUpdate: async (
		_parent: any,
		{ id, title, text }: { id: string; title: string | undefined; text: string | undefined },
		{ prisma }: Context
	) => {
		const postExists = await prisma.post.findUnique({
			where: {
				id: Number(id),
			},
		});

		if (!postExists) {
			return null;
		}

		const updatedPost = await prisma.post.update({
			where: {
				id: Number(id),
			},
			data: {
				title,
				text,
			},
		});
		return updatedPost;
	},
	postDelete: async (_parent: any, { id }: { id: string }, { prisma }: Context) => {
		try {
			await prisma.post.delete({
				where: {
					id: Number(id),
				},
			});
			return true;
		} catch (error) {
			return false;
		}
	},
};
