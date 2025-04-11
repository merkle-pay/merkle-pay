.PHONY: prisma-fmt prisma-migrate prisma-gen prisma-deploy

prisma-fmt:
	pnpm prisma format

prisma-migrate:
ifeq ($(strip $(NAME)),)
	@echo "Error: migrateion NAME is required." >&2
	@echo "Usage: make prisma-migrate NAME=<your_migration_name>" >&2
	exit 1
endif
	pnpm prisma migrate dev --create-only --name $(NAME)

prisma-gen:
	pnpm prisma generate

prisma-deploy:
	bash scripts/confirm-prisma-deploy.sh
