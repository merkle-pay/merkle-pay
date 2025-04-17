# General/Utility Targets
.PHONY: help i clean tag tags tree

# Development Targets
.PHONY: dev dev-pay dev-dashboard

# Build Targets
.PHONY: build build-pay build-dashboard

# Linting Targets
.PHONY: lint lint-pay lint-dashboard

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
	@echo "  tag TAG=<name>  - Create a Git tag or list all local tags if no TAG is provided"
	@echo "  tags            - Push all Git tags to the remote repository"
	@echo "  tree            - Generate directory tree of the project"

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

build-dashboard: build-pay
	pnpm --filter merkle-dashboard build
	mv $(DASHBOARD_DIR)/dist $(PAY_DIR)/publish/dashboard

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

 

 