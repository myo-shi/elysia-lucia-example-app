-- name: GetUser :one
SELECT * FROM "user"
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM "user"
WHERE email = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO "user" (
  email, password_hash
) VALUES (
  $1, $2
)
RETURNING *;