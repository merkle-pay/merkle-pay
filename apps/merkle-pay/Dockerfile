# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/merkle-pay ./apps/merkle-pay
RUN npm install -g pnpm@10.6.4 && pnpm install --frozen-lockfile
RUN cd apps/merkle-pay && pnpm prisma generate && pnpm --filter merkle-pay build

# Production stage
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/apps/merkle-pay/.next ./apps/merkle-pay/.next
COPY --from=builder /app/apps/merkle-pay/public ./apps/merkle-pay/public
COPY --from=builder /app/apps/merkle-pay/prisma ./apps/merkle-pay/prisma
COPY --from=builder /app/apps/merkle-pay/package.json ./apps/merkle-pay/package.json

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN npm install -g pnpm@10.6.4 && pnpm --dir apps/merkle-pay install --prod --frozen-lockfile
WORKDIR /app/apps/merkle-pay
ENV PORT=8888
EXPOSE 8888
# Explicitly disable entrypoint to prevent npm run start
ENTRYPOINT []
# Debug and run pnpm start
CMD ["/bin/sh", "-c", "echo 'Running pnpm start' && pnpm --version && pnpm --filter merkle-pay start"]