import { postMutationResolvers } from './post';
import { userMutationResolvers } from './user';

export const Mutation = {
	...postMutationResolvers,
	...userMutationResolvers,
};
