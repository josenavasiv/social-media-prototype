const typeDefs = `
	type Query {
		hello: String
		posts: [Post!]!
		post(id: ID!): Post
		me: User
	}

	type Mutation {
		postCreate(title: String!, text: String!): Post!
		postUpdate(id: ID!, title: String, text: String): Post
		postDelete(id: ID!): Boolean
		userRegister(credentials: UserCredentialsInput!, email: String!): UserPayload!
		userLogin(credentials: UserCredentialsInput!): UserPayload!
		userLogout: Boolean
	}

	type Post {
		id: ID!
		title: String!
		text: String!
		points: Int!
		user: User!
		createdAt: String!
		updatedAt: String!
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
`;

export default typeDefs;
