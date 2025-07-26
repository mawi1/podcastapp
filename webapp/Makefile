dev_db:
	docker compose --env-file ../.env -f compose-dev.yaml up -d

stop:
	docker compose --env-file ../.env -f compose-dev.yaml stop

push_schema:
	npx drizzle-kit push

generate_migration:
	npx drizzle-kit generate

migrate:
	npx drizzle-kit migrate

.PHONY: dev_db stop push_schema generate_migration migrate