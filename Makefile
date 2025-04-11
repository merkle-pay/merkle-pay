.PHONY: i dev-pay dev-dashboard dev build lint clean tag tags
i:
	pnpm install

dev:
	$(MAKE) -j2 dev-pay dev-dashboard

dev-pay:
	pnpm --filter merkle-pay dev

dev-dashboard:
	pnpm --filter merkle-dashboard dev

build:
	pnpm --filter merkle-pay build
	pnpm --filter merkle-dashboard build

lint:
	pnpm --filter merkle-pay lint
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

