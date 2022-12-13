import { Context } from 'src/types';
// import { Post } from '@prisma/client';

interface PostCreateArgs {
	title: string;
	text: string;
}

interface PostUpdateArgs {
	id: string;
	title?: string;
	text?: string;
}

// interface PostPayloadType {
// 	errors: {
// 		field: string;
// 		message: string;
// 	}[];
// 	post: Post | null;
// }

export const postMutationResolvers = {
	postCreate: async (_parent: any, { title, text }: PostCreateArgs, { prisma, req }: Context) => {
		// user is not logged in
		if (!req.session.userId) {
			throw new Error('Not Authenticated');
		}

		const post = await prisma.post.create({
			data: {
				title,
				text,
				creatorId: req.session.userId, // Only logged-in user can post
			},
		});
		return post;
	},
	postUpdate: async (_parent: any, { id, title, text }: PostUpdateArgs, { prisma, req }: Context) => {
		if (!req.session.userId) {
			throw new Error('Not Authenticated');
		}

		const postExists = await prisma.post.findUnique({
			where: {
				id: Number(id),
			},
		});

		if (!postExists) {
			return null;
		}

		if (postExists.creatorId !== req.session.userId) {
			throw new Error('Unauthorized');
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
	postDelete: async (_parent: any, { id }: { id: string }, { prisma, req }: Context) => {
		if (!req.session.userId) {
			throw new Error('Not Authenticated');
		}

		const postExists = await prisma.post.findUnique({
			where: {
				id: Number(id),
			},
		});

		// REFACTOR
		if (!postExists) {
			return false;
		}

		if (postExists.creatorId !== req.session.userId) {
			throw new Error('Unauthorized');
		}

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
	postVote: async (_parent: any, { id, value }: { id: string; value: number }, { prisma, req }: Context) => {
		if (!req.session.userId) {
			throw new Error('Not Authenticated');
		}

		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;

		const updootExists = await prisma.updoot.findFirst({
			where: {
				userId: req.session.userId,
				postId: parseInt(id),
			},
		});

		try {
			// User is updating their vote
			if (updootExists && updootExists.value !== realValue) {
				await prisma.updoot.update({
					where: {
						id: updootExists.id,
					},
					data: {
						value: realValue,
					},
				});

				await prisma.post.update({
					where: {
						id: parseInt(id),
					},
					data: {
						points: {
							...(realValue > 0 && { increment: 2 }),
							...(realValue < 0 && { decrement: 2 }),
						},
						// points: postExists.points + realValue,
					},
				});

				// User has never voted on this post before
			} else if (!updootExists) {
				// Create the updoot relationship
				await prisma.updoot.create({
					data: {
						userId: req.session.userId,
						postId: parseInt(id),
						value: realValue,
					},
				});

				// Update the points on the post
				await prisma.post.update({
					where: {
						id: parseInt(id),
					},
					data: {
						points: {
							...(realValue > 0 && { increment: 1 }),
							...(realValue < 0 && { decrement: 1 }),
						},
					},
				});
			}

			return true;
		} catch (error) {
			return false;
		}
	},
};
