.PHONY: dev build lint

dev:
	pnpm --filter merkle-pay dev
	pnpm --filter merkle-dashboard dev

build:
	pnpm --filter merkle-pay build && \
	pnpm --filter merkle-dashboard build

lint:
	pnpm --filter merkle-pay lint
	pnpm --filter merkle-dashboard lint

clean:
	rm -rf node_modules
	rm -rf apps/merkle-pay/node_modules