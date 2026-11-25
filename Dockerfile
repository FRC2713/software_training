# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS builder
WORKDIR /app/site
COPY site/package.json site/package-lock.json ./
RUN npm ci
WORKDIR /app
COPY lessons ./lessons
COPY site ./site
WORKDIR /app/site
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ARG APP_REVISION=development
ENV APP_REVISION=${APP_REVISION}
LABEL org.opencontainers.image.revision=${APP_REVISION}
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs hawklearn \
  && mkdir -p /data \
  && chown hawklearn:nodejs /data
COPY --from=builder --chown=hawklearn:nodejs /app/site/dist ./site/dist
COPY --chown=hawklearn:nodejs server.mjs ./server.mjs
COPY --chown=hawklearn:nodejs server ./server
COPY --chown=hawklearn:nodejs .hawk ./.hawk
COPY --chown=hawklearn:nodejs scripts/deploy-check.mjs ./scripts/deploy-check.mjs
USER hawklearn
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
