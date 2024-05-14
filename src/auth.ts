import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import Elysia, { t } from "elysia";
import { Lucia, type Session, type User } from "lucia";
import postgres, { type Sql } from "postgres";
import { createUser, getUser } from "./db/query_sql";

const sql = postgres({
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT) || undefined,
	username: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE,
});

const adapter = new PostgresJsAdapter(sql, {
	user: "user",
	session: "user_session",
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: (process.env.ENV ?? process.env.NODE_ENV) === "PRODUCTION",
		},
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		UserId: number;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}

export const auth = new Elysia({ name: "auth" })
	.derive(
		{ as: "global" },
		async (
			context,
		): Promise<
			| {
					user: User;
					session: Session;
			  }
			| { user: null; session: null }
		> => {
			// use headers instead of Cookie API to prevent type coercion
			const cookieHeader = context.request.headers.get("Cookie") ?? "";
			const sessionId = lucia.readSessionCookie(cookieHeader);
			if (!sessionId) {
				return {
					user: null,
					session: null,
				};
			}

			const result = await lucia.validateSession(sessionId);
			if (result.session?.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				context.cookie[sessionCookie.name].set({
					value: sessionCookie.value,
					...sessionCookie.attributes,
				});
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				context.cookie[sessionCookie.name].set({
					value: sessionCookie.value,
					...sessionCookie.attributes,
				});
			}
			return result;
		},
	)
	.macro(({ onBeforeHandle }) => {
		return {
			isSignIn() {
				onBeforeHandle(async ({ session, set }) => {
					if (!session) {
						set.status = "Unauthorized";
						return "Please sign in";
					}
				});
			},
		};
	})
	.guard(
		{
			body: t.Object({
				email: t.String(),
				password: t.String(),
			}),
		},
		(app) =>
			app
				.post("/sign-up", async ({ body, cookie, set }) => {
					const passwordHash = await Bun.password.hash(body.password);
					const user = await createUser(sql, {
						email: body.email,
						passwordHash: passwordHash,
					}).catch((err: Error) => err);
					if (!user || user instanceof Error) {
						set.status = "Bad Request";
						return "Email already used";
					}
					const session = await lucia.createSession(user.id, {});
					const sessionCookie = lucia.createSessionCookie(session.id);
					cookie[sessionCookie.name].set({
						...sessionCookie.attributes,
						value: sessionCookie.value,
					});
					return "Sign up is completed!";
				})
				.post("/sign-in", async ({ body, cookie, set }) => {
					const user = await getUser(sql, { email: body.email });
					if (!user) {
						set.status = "Bad Request";
						return "Invalid email or password";
					}
					const validPassword = await Bun.password.verify(
						body.password,
						user.passwordHash,
					);
					if (!validPassword) {
						set.status = "Bad Request";
						return "Invalid email or password";
					}

					const session = await lucia.createSession(user.id, {});
					const sessionCookie = lucia.createSessionCookie(session.id);
					cookie[sessionCookie.name].set({
						...sessionCookie.attributes,
						value: sessionCookie.value,
					});
					return `Sign in as ${body.email}`;
				}),
	)
	.resolve(({ session, user, set }) => {
		if (!session || !user) {
			set.status = "Unauthorized";
			throw new Error("...");
		}
		return {
			session: session,
			user: user,
		};
	})
	.post("/sign-out", async ({ session }) => {
		await lucia.invalidateSession(session.id);
		return "Sign out";
	})
	.post("/profile", async ({ user }) => {
		return user;
	});
