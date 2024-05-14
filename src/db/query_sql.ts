import { Sql } from "postgres";

export const getUserQuery = `-- name: GetUser :one
SELECT id, email, password_hash FROM "user"
WHERE email = $1 LIMIT 1`;

export interface GetUserArgs {
    email: string;
}

export interface GetUserRow {
    id: number;
    email: string;
    passwordHash: string;
}

export async function getUser(sql: Sql, args: GetUserArgs): Promise<GetUserRow | null> {
    const rows = await sql.unsafe(getUserQuery, [args.email]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
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

export async function createUser(sql: Sql, args: CreateUserArgs): Promise<CreateUserRow | null> {
    const rows = await sql.unsafe(createUserQuery, [args.email, args.passwordHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1],
        passwordHash: row[2]
    };
}

