An example app to try session management using Elysia and Lucia.

Elysia + Lucia でセッション管理をするExampleです。  
私はElysiaのLife Cycleに関する知識が浅いため、もう少し良い実装方法があるかもしれません。

## 構成

- Bun backend FW
  - [Elysia](https://github.com/elysiajs/elysia)
- Session management
  - [Lucia](https://github.com/lucia-auth/lucia)
- ORM
  - [sqlc-gen-typescript](https://github.com/sqlc-dev/sqlc-gen-typescript)
    - [この記事](https://zenn.dev/shiguredo/articles/sqlc-gen-typescript)を読んで、気になったので使ってみました。

## How to run

Luciaのセッション管理用のデータベースにPostgresを採用しているので、docker-composeで立ち上げます。

```sh
docker compose up
```

DBの初期化を行います。

```sh
docker run -it --rm -v ./db:/db --network=host postgres psql -h localhost -U postgres -f /db/schema.sql
```

アプリケーションを立ち上げます。

```sh
bun i
bun run dev
```

## TODO

- テスト書いてみる
- Role Based Access Controlを試す([Casbin](https://casbin.org/ja/)?)