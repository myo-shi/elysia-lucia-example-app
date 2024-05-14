import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";

const app = new Elysia()
	.use(cors()) // ちゃんとする
	.use(auth)
	.get("/", () => "hi")
	.guard({ isSignIn: null }, (app) =>
		// auth pluginのisSignInマクロを使ってセッションがあることをチェックできる。
		// ついでにcontext内のプロパティに対してtype guardができるといいのだが…。
		app.get("/me", ({ user }) => ({ ...user })),
	)
	.onError(({ code }) => {
		if (code === "NOT_FOUND") return "Route not found :(";
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
