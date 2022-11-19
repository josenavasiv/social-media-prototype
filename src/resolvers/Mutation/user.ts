import { Context } from 'src/types';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '@prisma/client';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../../constants';
import { sendEmail } from '../../utilities/sendEmail';
import { v4 } from 'uuid';

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

		if (!validUsername || username.includes('@')) {
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
			} else if (error.meta.target.includes('email')) {
				return {
					errors: [{ field: 'email', message: 'Email unavailable' }],
					user: null,
				};
			}

			return {
				errors: [{ field: 'username', message: 'Server error' }],
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

	userForgotPassword: async (
		_parent: any,
		{ email }: { email: string },
		{ prisma, redis }: Context
	): Promise<Boolean> => {
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		// Email provided DNE -> Client says if email exists, sent a password recovery email
		if (!user) {
			return true;
		}

		// 1. Generate a token with uuid OR JWT
		// 2. Save to redis database -> Token only good for 1 reset password
		// 3. Compare token within link with token in database
		const token = v4();
		await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24); // KEY - VALUE (Expires in 1 day)
		await sendEmail(user.email, `<a href=http://localhost:3000/change-password/${token}>Reset Password</a>`);

		return true;
	},

	userChangePassword: async (
		_parent: any,
		{ token, newPassword }: { token: string; newPassword: string },
		{ prisma, redis, req }: Context
	): Promise<UserPayloadType> => {
		const validNewPassword = validator.isLength(newPassword, { min: 5 });
		if (!validNewPassword) {
			return {
				errors: [{ field: 'newPassword', message: 'Invalid password' }],
				user: null,
			};
		}

		// Check if redis token exists within the redis db
		const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);

		if (!userId) {
			return {
				errors: [{ field: 'token', message: 'Token expired' }],
				user: null,
			};
		}

		const user = await prisma.user.findUnique({
			where: {
				id: parseInt(userId),
			},
		});

		if (!user) {
			return {
				errors: [{ field: 'token', message: 'User no longer exists' }],
				user: null,
			};
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				password: hashedNewPassword,
			},
		});

		// Login user after change password
		req.session.userId = user.id;

		// Remove token from redis db after changing the password
		await redis.del(FORGOT_PASSWORD_PREFIX + token);

		return {
			errors: [],
			user,
		};
	},
};
