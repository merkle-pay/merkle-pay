# General/Utility Targets
.PHONY: i clean tag tags tree

# Development Targets
.PHONY: dev dev-pay dev-dashboard

# Build Targets
.PHONY: build build-pay build-dashboard

# Linting Targets
.PHONY: lint lint-pay lint-dashboard

i:
	pnpm install

dev:
	$(MAKE) -j2 dev-pay dev-dashboard

dev-pay:
	pnpm --filter merkle-pay dev

dev-dashboard:
	pnpm --filter merkle-dashboard dev

build:
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
	rm -rf node_modules
	rm -rf apps/merkle-pay/node_modules
	rm -rf apps/merkle-dashboard/node_modules

tag:
ifeq ($(strip $(TAG)),)
	@echo "Listing all tags" >&2
	@echo "Usage: make tag TAG=<your_tag_name> if you want to create a new one" >&2
	exit 0
endif
	git tag $(TAG)

tags:
	git push --tags

tree:
	tree --opt-toggle -I node_modules > tree.txt

d-up:
	docker compose --env-file .env up -d

d-stop:
	docker compose stop

d-down:
	docker compose down

d-clean:
	docker compose down -v --rmi all
