// export * from './Query'; // Export everything from './Query'
// export * from './Mutation/Mutation';

import { Query } from './Query';
import { Mutation } from './Mutation/Mutation';

const resolvers = {
	Query,
	Mutation,
};

export default resolvers;
