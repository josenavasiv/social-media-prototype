import { Context } from 'src/types';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '@prisma/client';
import { COOKIE_NAME } from '../../constants';

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
		field: string;
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

		const validUsername = validator.isLength(username, { min: 3 });
		const validEmail = validator.isEmail(email);
		const validPassword = validator.isLength(password, { min: 5 });

		if (!validUsername) {
			return {
				errors: [{ field: 'username', message: 'Invalid username' }],
				user: null,
			};
		}

		if (!validEmail) {
			return {
				errors: [{ field: 'email', message: 'Invalid email' }],
				user: null,
			};
		}
		if (!validPassword) {
			return {
				errors: [{ field: 'password', message: 'Invalid password' }],
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
					errors: [{ field: 'username', message: 'Username unavailable' }],
					user: null,
				};
			}

			return {
				errors: [{ field: 'server', message: 'Server error' }],
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
						field: 'username',
						message: 'Invalid username',
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
						field: 'password',
						message: 'Invalid password',
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

	userLogout: async (_parent: any, _args: any, { res, req }: Context): Promise<Boolean> => {
		// Removes the session from redis
		return new Promise((resolve) =>
			req.session.destroy((error) => {
				// Clears the cookie of the response object
				res.clearCookie(COOKIE_NAME);
				if (error) {
					console.log(error);
					resolve(true);
					return;
				}

				resolve(false);
			})
		);
	},
};
