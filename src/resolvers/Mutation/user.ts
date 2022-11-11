import { Context } from 'src/types';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '@prisma/client';

interface UserLoginArgs {
	credentials: {
		username: string;
		password: string;
	};
}

interface UserRegisterArgs extends UserLoginArgs {
	email: string;
}

interface UserPayloadType {
	errors: {
		message: string;
	}[];
	user: User | null;
}

export const userMutationResolvers = {
	userRegister: async (
		_parent: any,
		{ credentials, email }: UserRegisterArgs,
		{ req, prisma }: Context
	): Promise<UserPayloadType> => {
		const { username, password } = credentials;

		const validEmail = validator.isEmail(email);
		const validPassword = validator.isLength(password, { min: 5 });

		if (!validEmail) {
			return {
				errors: [{ message: 'Invalid email' }],
				user: null,
			};
		}
		if (!validPassword) {
			return {
				errors: [{ message: 'Invalid password' }],
				user: null,
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			const user = await prisma.user.create({
				data: {
					username,
					password: hashedPassword,
					email,
				},
			});

			// Logs in user after registering
			req.session.userId = user.id;

			return {
				errors: [],
				user,
			};
		} catch (error: any) {
			if (error.code === 'P2002' || error.meta.target.includes('username')) {
				return {
					errors: [{ message: 'Username unavailable' }],
					user: null,
				};
			}

			return {
				errors: [{ message: 'Server error' }],
				user: null,
			};
		}
	},
	userLogin: async (
		_parent: any,
		{ credentials }: UserLoginArgs,
		{ req, prisma }: Context
	): Promise<UserPayloadType> => {
		const { username, password } = credentials;

		const user = await prisma.user.findUnique({
			where: {
				username: username,
			},
		});

		if (!user) {
			return {
				errors: [
					{
						message: 'Invalid credentials',
					},
				],
				user: null,
			};
		}

		const correctPassword = await bcrypt.compare(password, user.password);

		if (!correctPassword) {
			return {
				errors: [
					{
						message: 'Invalid credentials',
					},
				],
				user: null,
			};
		}

		// Setting the cookie to the request object -> Sent in the Express app's response to client
		// Set a cookie on the user and keeps them logged in
		req.session.userId = user.id;

		return {
			errors: [],
			user,
		};
	},
};
