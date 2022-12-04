// export * from './Query'; // Export everything from './Query'
// export * from './Mutation/Mutation';

import { Query } from './Query';
import { Mutation } from './Mutation/Mutation';
import { User } from './User';
import { Post } from './Post';

const resolvers = {
	Query,
	Mutation,
	User,
	Post,
};

export default resolvers;
