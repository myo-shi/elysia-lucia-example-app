import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getUserQuery = `-- name: GetUser :one
SELECT id, email, password_hash FROM "user"
WHERE id = $1 LIMIT 1`;

export interface GetUserArgs {
    id: number;
}

export interface GetUserRow {
    id: number;
    email: string;
    passwordHash: string;
}

export async function getUser(client: Client, args: GetUserArgs): Promise<GetUserRow | null> {
    const result = await client.query({
        text: getUserQuery,
        values: [args.id],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        passwordHash: row[2]
    };
}

export const getUserByEmailQuery = `-- name: GetUserByEmail :one
SELECT id, email, password_hash FROM "user"
WHERE email = $1 LIMIT 1`;

export interface GetUserByEmailArgs {
    email: string;
}

export interface GetUserByEmailRow {
    id: number;
    email: string;
    passwordHash: string;
}

export async function getUserByEmail(client: Client, args: GetUserByEmailArgs): Promise<GetUserByEmailRow | null> {
    const result = await client.query({
        text: getUserByEmailQuery,
        values: [args.email],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        passwordHash: row[2]
    };
}

export const createUserQuery = `-- name: CreateUser :one
INSERT INTO "user" (
  email, password_hash
) VALUES (
  $1, $2
)
RETURNING id, email, password_hash`;

export interface CreateUserArgs {
    email: string;
    passwordHash: string;
}

export interface CreateUserRow {
    id: number;
    email: string;
    passwordHash: string;
}

export async function createUser(client: Client, args: CreateUserArgs): Promise<CreateUserRow | null> {
    const result = await client.query({
        text: createUserQuery,
        values: [args.email, args.passwordHash],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row[0],
        email: row[1],
        passwordHash: row[2]
    };
}

