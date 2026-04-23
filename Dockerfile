FROM golang:1.26-alpine AS contractor-setup
RUN apk add --no-cache git
RUN go install github.com/smtdfc/contractor@main


FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app


COPY --from=contractor-setup /go/bin/contractor /usr/local/bin/contractor
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm contract



FROM base AS auth-builder
RUN pnpm --filter @wind-work/auth-service... service:build
RUN pnpm --filter @wind-work/auth-service --prod deploy /app/out --legacy

FROM node:20-alpine AS auth-service
WORKDIR /app
COPY --from=auth-builder /app/out ./
EXPOSE 3001
CMD ["node", "dist/src/main.js"]

FROM base AS monolithic-builder
RUN pnpm --filter @wind-work/monolithic... service:build
RUN pnpm --filter @wind-work/monolithic --prod deploy /app/out --legacy

FROM node:20-alpine AS monolithic-node
WORKDIR /app
COPY --from=monolithic-builder /app/out ./
EXPOSE 3000
CMD ["node", "dist/src/main.js"]