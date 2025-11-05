# General/Utility Targets
.PHONY: help i clean tag tags tree

# Development Targets
.PHONY: dev dev-pay dev-dashboard dev-server

# Build Targets
.PHONY: build build-pay build-dashboard build-server

# Linting Targets
.PHONY: lint lint-pay lint-dashboard lint-server

# Docker Targets
.PHONY: d-up d-stop d-restart d-down d-clean d-logs

# Variables
PAY_DIR := apps/merkle-pay
DASHBOARD_DIR := apps/merkle-dashboard

# Default target
help:
	@echo "Available targets:"
	@echo "  i               - Install pnpm dependencies"
	@echo "  dev             - Run dev for pay and dashboard"
	@echo "  build           - Build pay and dashboard"
	@echo "  lint            - Lint pay and dashboard"
	@echo "  clean           - Remove node_modules and build artifacts"
	@echo "  d-up            - Build Docker Compose images and start containers"
	@echo "  d-stop          - Stop Docker Compose containers"
	@echo "  d-restart       - Restart Docker Compose containers"
	@echo "  d-down          - Stop and remove Docker compose containers"
	@echo "  d-clean         - Clean all Docker resources, including images, containers, volumes, and networks"
	@echo "  d-logs          - Tail the logs of the Docker Compose containers"
	@echo "  tag TAG=<name>  - Create a Git tag or list all local tags if no TAG is provided"
	@echo "  tags            - Push all Git tags to the remote repository"
	@echo "  tree            - Generate directory tree of the project"
	@echo "  so-build        - Build merkle-pay standalone image"
	@echo "  so-run          - Run merkle-pay standalone container"
	@echo "  so-push         - Push merkle-pay standalone image to remote repository"
	@echo "  migrate-status  - Check migration status"
	@echo "  migrate-up      - Run pending migrations"
	@echo "  migrate-down    - Rollback last migration"
	@echo "  migrate-create NAME=<name> - Create new migration"


i:
	pnpm install

dev: i
	$(MAKE) -j3 dev-pay dev-dashboard dev-server

dev-pay:
	pnpm exec dotenv -e .env -- pnpm --filter merkle-pay dev

dev-dashboard:
	pnpm exec dotenv -e .env -- pnpm --filter merkle-dashboard dev

dev-server:
	pnpm exec dotenv -e .env -- pnpm --filter merkle-server dev

# Build Targets do not use dotenv-cli, because they are from docker compose yml
build: i
	$(MAKE) -j3 build-pay build-dashboard build-server

build-pay:
	pnpm --filter merkle-pay build

build-dashboard:
	pnpm --filter merkle-dashboard build

build-server:
	pnpm --filter merkle-server build

lint:
	$(MAKE) -j3 lint-pay lint-dashboard lint-server

lint-pay:
	pnpm --filter merkle-pay lint

lint-dashboard:
	pnpm --filter merkle-dashboard lint

lint-server:
	pnpm --filter merkle-server lint

clean:
	rm -rf node_modules || true
	rm -rf $(PAY_DIR)/node_modules $(PAY_DIR)/dist || true
	rm -rf $(DASHBOARD_DIR)/node_modules $(DASHBOARD_DIR)/dist || true

tag:
ifeq ($(strip $(TAG)),)
	@echo "Listing all local tags:"
	@git tag -l
else
	@if [ "$(shell git tag -l $(TAG))" = "$(TAG)" ]; then \
		echo "Error: Tag $(TAG) already exists" >&2; \
		exit 1; \
	fi
	@git tag $(TAG)
	@echo "Created tag $(TAG)"
endif

tags:
	git push --tags

tree:
	tree -I node_modules > tree.txt

d-up:
	docker compose up -d

d-stop:
	docker compose stop

d-restart:
	docker compose restart

d-down:
	docker compose down

# Warning: Deletes all Docker resources
d-clean:
	docker compose down -v --rmi all --remove-orphans

d-logs:
	docker compose logs -f

# Database Migrations (standalone service)
migrate-status:
	cd migrate && npm run migrate:status

migrate-up:
	cd migrate && npm run migrate:up

migrate-down:
	cd migrate && npm run migrate:down

migrate-create:
	cd migrate && npm run migrate:create -- $(NAME)

push:
	@if [ "$$(git branch --show-current)" != "main" ]; then \
		echo "Error: Not on main branch. Current branch: $$(git branch --show-current)"; \
		exit 1; \
	fi
	git push origin main && git push --tags