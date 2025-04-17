# Makefile for Monorepo Management

# Variables
PAY_DIR := apps/merkle-pay
DASHBOARD_DIR := apps/merkle-dashboard

# --- Build Output Directories ---
# Adjust these if your apps output to different directory names
PAY_BUILD_OUTPUT := $(PAY_DIR)/.next
DASHBOARD_BUILD_OUTPUT := $(DASHBOARD_DIR)/dist
PAY_PRISMA_CLIENT := $(PAY_DIR)/prisma/client # Path to generated Prisma client

# --- Destination for Copied Dashboard ---
# This should match the 'public' directory in your Next.js app
NEXTJS_PUBLIC_DASHBOARD := $(PAY_DIR)/public/dashboard

# ==============================================================================
# Help Target - Displays available commands
# ==============================================================================
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  --- General ---"
	@echo "  i                    - Install pnpm dependencies"
	@echo "  clean                - Remove node_modules, build artifacts, and generated Prisma client"
	@echo "  tree                 - Generate directory tree of the project (requires 'tree' command)"
	@echo ""
	@echo "  --- Development ---"
	@echo "  dev                  - Run dev servers for pay and dashboard in parallel"
	@echo "  dev-pay              - Run dev server for pay (Next.js app)"
	@echo "  dev-dashboard        - Run dev server for dashboard (React SPA)"
	@echo ""
	@echo "  --- Build ---"
	@echo "  build                - Generate Prisma client, build pay, build dashboard, copy dashboard"
	@echo "  prisma-generate-pay  - Generate Prisma client for pay app"
	@echo "  build-pay            - Build pay (Next.js app) only (includes Prisma generate)"
	@echo "  build-dashboard      - Build dashboard (React SPA) only"
	@echo ""
	@echo "  --- Linting ---"
	@echo "  lint                 - Lint pay and dashboard in parallel"
	@echo "  lint-pay             - Lint pay (Next.js app) only"
	@echo "  lint-dashboard       - Lint dashboard (React SPA) only"
	@echo ""
	@echo "  --- Git Tags ---"
	@echo "  tag TAG=<name>       - Create a Git tag or list local tags if no TAG is provided"
	@echo "  tags                 - Push all Git tags to the remote repository"


# ==============================================================================
# Dependency Installation
# ==============================================================================
# Useful for local setup. Vercel uses its own install step.
.PHONY: i
i:
	pnpm install


# ==============================================================================
# Development Targets
# ==============================================================================
.PHONY: dev dev-pay dev-dashboard

# Run both development servers concurrently
dev: i
	@echo "Starting development servers for pay and dashboard..."
	$(MAKE) -j2 dev-pay dev-dashboard

# Run dev server for the Next.js app
dev-pay: i
	pnpm --filter merkle-pay dev

# Run dev server for the React SPA
dev-dashboard: i
	pnpm --filter merkle-dashboard dev


# ==============================================================================
# Build Targets - Sequence: prisma-gen -> build-pay -> build-dashboard -> copy
# ==============================================================================
.PHONY: build build-pay build-dashboard copy-dashboard-to-pay prisma-generate-pay

# Main build target orchestrating the sequence
# Assumes 'pnpm install' was already run (e.g., by Vercel's install step)
build: prisma-generate-pay build-pay build-dashboard copy-dashboard-to-pay
	@echo "Build sequence complete. Final artifacts in $(PAY_DIR)/.next and $(PAY_DIR)/public/dashboard"

# Step 1: Generate Prisma Client for merkle-pay
# Assumes dependencies (prisma CLI) are installed
prisma-generate-pay:
	@echo "Generating Prisma client for merkle-pay..."
	# Use pnpm exec to run the prisma CLI installed within the merkle-pay workspace
	pnpm --filter merkle-pay exec prisma generate
	@echo "Prisma client generated."

# Step 2: Build the Next.js app (merkle-pay)
# Now depends on the prisma client being generated first
build-pay: prisma-generate-pay
	@echo "Building Next.js app (merkle-pay)..."
	pnpm --filter merkle-pay build
	@echo "Next.js app build finished. \nOutput: $(PAY_BUILD_OUTPUT)"

# Step 3: Build the React SPA (merkle-dashboard)
build-dashboard:
	@echo "Building Dashboard SPA (merkle-dashboard)..."
	pnpm --filter merkle-dashboard build
	@echo "Dashboard SPA build finished. \nOutput: $(DASHBOARD_BUILD_OUTPUT)"

# Step 4: Copy the built dashboard assets into the Next.js public directory
# Depends on build-dashboard to ensure source files exist
copy-dashboard-to-pay: build-dashboard
	@echo "Copying dashboard build from $(DASHBOARD_BUILD_OUTPUT) to $(NEXTJS_PUBLIC_DASHBOARD)..."
	# Ensure target directory exists
	mkdir -p $(NEXTJS_PUBLIC_DASHBOARD)
	# Clean the target directory before copying (prevents stale files)
	rm -rf $(NEXTJS_PUBLIC_DASHBOARD)/*
	# Copy the contents of the SPA build output directory (incl. hidden files)
	cp -Rp $(DASHBOARD_BUILD_OUTPUT)/. $(NEXTJS_PUBLIC_DASHBOARD)/
	@echo "Dashboard assets copied successfully."


# ==============================================================================
# Linting Targets
# ==============================================================================
.PHONY: lint lint-pay lint-dashboard

# Run linters for both apps concurrently
lint:
	$(MAKE) -j2 lint-pay lint-dashboard

# Lint the Next.js app
lint-pay:
	pnpm --filter merkle-pay lint

# Lint the React SPA
lint-dashboard:
	pnpm --filter merkle-dashboard lint


# ==============================================================================
# Cleanup Target
# ==============================================================================
.PHONY: clean
clean:
	@echo "Cleaning project..."
	# Remove root node_modules
	rm -rf node_modules || true
	# Remove app-specific node_modules and build artifacts
	rm -rf $(PAY_DIR)/node_modules $(PAY_BUILD_OUTPUT) || true
	rm -rf $(DASHBOARD_DIR)/node_modules $(DASHBOARD_BUILD_OUTPUT) || true
	# Remove the copied dashboard assets from the Next.js public directory
	rm -rf $(NEXTJS_PUBLIC_DASHBOARD) || true
	# Remove the generated Prisma client
	rm -rf $(PAY_PRISMA_CLIENT) || true
	@echo "Clean complete."


# ==============================================================================
# Git Tagging Targets
# ==============================================================================
.PHONY: tag tags

# Create a Git tag or list existing tags
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

# Push all local tags to the remote repository
tags:
	git push --tags


# ==============================================================================
# Utility Target - Directory Tree
# ==============================================================================
.PHONY: tree
tree:
	@command -v tree >/dev/null 2>&1 || { echo "Error: 'tree' command not found. Please install it."; exit 1; }
	@echo "Generating project tree (excluding node_modules, .next, .git)..."
	tree -I 'node_modules|.next|.git' > tree.txt
	@echo "Project tree saved to tree.txt"

