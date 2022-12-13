import { Post } from '@prisma/client';
import { Context } from '../types';

interface PostsArgs {
	limit: number;
	cursor?: number; // Basing off of new (createdAt)
}

interface PaginatedPostsPayloadType {
	posts: Post[];
	hasMore: boolean;
}

export const Query = {
	hello: (_parent: any, _args: any, _context: Context) => {
		return 'Hello World';
	},

	posts: async (
		_parent: any,
		{ limit, cursor }: PostsArgs,
		{ prisma, req }: Context
	): Promise<PaginatedPostsPayloadType> => {
		const realLimit = Math.min(50, limit);

		const posts = cursor
			? await prisma.post.findMany({
					take: realLimit,
					skip: 1,
					cursor: {
						id: cursor,
					},
					orderBy: [
						{
							createdAt: 'desc',
						},
					],
			  })
			: await prisma.post.findMany({
					take: realLimit,
					orderBy: [
						{
							createdAt: 'desc',
						},
					],
			  });

		if (req.session.userId) {
			const postsWithVoteStatus = await Promise.all(
				posts.map(async (post) => {
					const updoot = await prisma.updoot.findFirst({
						where: {
							userId: req.session.userId,
							postId: post.id,
						},
					});

					return {
						...post,
						voteStatus: updoot ? updoot.value : null,
					};
				})
			);

			console.log(postsWithVoteStatus);

			return {
				posts: postsWithVoteStatus,
				hasMore: postsWithVoteStatus.length === realLimit,
			};
		} else {
			return {
				posts,
				hasMore: posts.length === realLimit,
			};
		}
	},

	post: async (_parent: any, args: { id: string }, { prisma }: Context) => {
		const post = await prisma.post.findUnique({
			where: {
				id: Number(args.id),
			},
		});

		// NEED TO PROVIDE THE SIMILAR DATA AS ABOVE TO UPDATE THE VOTE STATUS (IN POSTS)

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
