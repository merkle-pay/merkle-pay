# General/Utility Targets
.PHONY: help i clean tag tags tree

# Development Targets
.PHONY: dev dev-pay dev-dashboard

# Build Targets
.PHONY: build build-pay build-dashboard

# Linting Targets
.PHONY: lint lint-pay lint-dashboard

# Docker Targets
.PHONY: d-up d-stop d-restart d-down d-clean

# Variables
PAY_DIR := apps/merkle-pay
DASHBOARD_DIR := apps/merkle-dashboard
DOCKER_COMPOSE_ENV_FILE := --env-file $(PAY_DIR)/.env

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
	@echo "  tag TAG=<name>  - Create a Git tag or list all local tags if no TAG is provided"
	@echo "  tags            - Push all Git tags to the remote repository"
	@echo "  tree            - Generate directory tree of the project"
	@echo "  so-build        - Build merkle-pay standalone image"
	@echo "  so-run          - Run merkle-pay standalone container"

i:
	pnpm install

dev: i
	$(MAKE) -j2 dev-pay dev-dashboard

dev-pay:
	pnpm --filter merkle-pay dev

dev-dashboard:
	pnpm --filter merkle-dashboard dev

build: i
	$(MAKE) -j2 build-pay build-dashboard

build-pay:
	pnpm --filter merkle-pay build

build-dashboard:
	pnpm --filter merkle-dashboard build

lint:
	$(MAKE) -j2 lint-pay lint-dashboard

lint-pay:
	pnpm --filter merkle-pay lint

lint-dashboard:
	pnpm --filter merkle-dashboard lint

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
	@command -v tree >/dev/null 2>&1 || { echo "Error: tree command not found"; exit 1; }
	tree -I node_modules > tree.txt

d-up:
	docker compose $(DOCKER_COMPOSE_ENV_FILE) up -d

d-stop:
	docker compose $(DOCKER_COMPOSE_ENV_FILE) stop

d-restart:
	docker compose $(DOCKER_COMPOSE_ENV_FILE) restart

d-down:
	docker compose $(DOCKER_COMPOSE_ENV_FILE) down

# Warning: Deletes all Docker resources and Caddy data/config
d-clean:
	docker compose $(DOCKER_COMPOSE_ENV_FILE) down -v --rmi all --remove-orphans
	rm -rf caddy/data/caddy caddy/config/caddy

# merkle-pay standalone image
.PHONY: so-build so-run

so-build:
	docker build --build-arg VITE_TURNSTILE_SITE_KEY=$(TURNSTILE_SITE_KEY) -t merkle-pay-standalone .

so-run:
	docker run -d -p 3000:3000 --name mp-standalone --env-file $(PAY_DIR)/.env merkle-pay-standalone
