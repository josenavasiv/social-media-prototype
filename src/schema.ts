const typeDefs = `
	type Query {
		hello: String
		posts(limit: Int!, cursor: Int): PaginatedPostsPayload!
		post(id: ID!): Post
		me: User
	}

	type Mutation {
		postCreate(title: String!, text: String!): Post!
		postUpdate(id: ID!, title: String, text: String): Post
		postDelete(id: ID!): Boolean
		postVote(id: ID!, value: Int!): Boolean
		userRegister(credentials: UserCredentialsInput!, email: String!): UserPayload!
		userLogin(credentials: UserCredentialsInput!): UserPayload!
		userLogout: Boolean!
		userForgotPassword(email: String!): Boolean!
		userChangePassword(token: String!, newPassword: String!): UserPayload!
	}

	type Post {
		id: ID!
		title: String!
		text: String!
		points: Int!
		user: User!
		createdAt: String!
		updatedAt: String!
		updoots: [Updoot!]!
		voteStatus: Int
	}

	type PostPayload {
		errors: [Error!]!
		post: Post
	}

	type User {
		id: ID!
		username: String!
		email: String!
		posts: [Post!]!
		createdAt: String!
		updatedAt: String!
		updoots: [Updoot!]!
	}

	type UserPayload {
		errors: [Error!]!
		user: User
	}

	input UserCredentialsInput {
		username: String!
		password: String!
	}

	type Error {
		field: String!
		message: String!
	}

	type PaginatedPostsPayload {
		posts: [Post!]!
		hasMore: Boolean!
	}

	type Updoot {
		id: ID!
		value: Int!
		userId: Int!
		postId: Int!
	}
`;

export default typeDefs;
