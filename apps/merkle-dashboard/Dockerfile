# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_TURNSTILE_SITE_KEY

ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/merkle-dashboard ./apps/merkle-dashboard
RUN npm install -g pnpm@10.6.4 && pnpm install --frozen-lockfile
RUN cd apps/merkle-dashboard && pnpm --filter merkle-dashboard build