FROM node:22-alpine AS pay-builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/merkle-pay ./apps/merkle-pay
RUN npm install -g pnpm@10.6.4 && pnpm install --frozen-lockfile
RUN cd apps/merkle-pay && pnpm prisma generate && pnpm --filter merkle-pay build


# Build stage
FROM node:22-alpine AS dashboard-builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/merkle-dashboard ./apps/merkle-dashboard
RUN npm install -g pnpm@10.6.4 && pnpm install --frozen-lockfile
RUN cd apps/merkle-dashboard && pnpm --filter merkle-dashboard build


# production stage
FROM node:22-alpine 
WORKDIR /app

COPY --from=pay-builder /app/apps/merkle-pay/.next ./apps/merkle-pay/.next
COPY --from=pay-builder /app/apps/merkle-pay/public ./apps/merkle-pay/public
COPY --from=pay-builder /app/apps/merkle-pay/prisma ./apps/merkle-pay/prisma
COPY --from=pay-builder /app/apps/merkle-pay/package.json ./apps/merkle-pay/package.json

COPY --from=pay-builder /app/package.json ./package.json
COPY --from=pay-builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pay-builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN npm install -g pnpm@10.6.4 && pnpm --dir apps/merkle-pay install --prod --frozen-lockfile

COPY --from=dashboard-builder /app/apps/merkle-dashboard/dist ./apps/merkle-pay/public/dashboard

EXPOSE 3000
# Explicitly disable entrypoint to prevent npm run start
ENTRYPOINT []
# Debug and run pnpm start
CMD ["/bin/sh", "-c", "echo 'Running pnpm start' && pnpm --version && pnpm --filter merkle-pay start"]