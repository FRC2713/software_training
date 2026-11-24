# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21-alpine AS maze-solver
ARG MAZE_SOLVER_REPO=https://github.com/FRC2713/maze-solver-java.git
ARG MAZE_SOLVER_REF=main
RUN apk add --no-cache git \
  && git clone --depth 1 --branch "${MAZE_SOLVER_REF}" "${MAZE_SOLVER_REPO}" /maze-solver \
  && cd /maze-solver \
  && mvn -B -q -DskipTests package

FROM node:24-bookworm-slim AS builder
WORKDIR /app/site
COPY site/package.json site/package-lock.json ./
RUN npm ci
WORKDIR /app
COPY lessons ./lessons
COPY site ./site
COPY --from=maze-solver /maze-solver/target/maze-solver.jar ./site/public/maze-solver.jar
WORKDIR /app/site
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ARG APP_REVISION=development
ENV APP_REVISION=${APP_REVISION}
LABEL org.opencontainers.image.revision=${APP_REVISION}
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs hawklearn
COPY --from=builder --chown=hawklearn:nodejs /app/site/dist ./site/dist
COPY --chown=hawklearn:nodejs server.mjs ./server.mjs
COPY --chown=hawklearn:nodejs .hawk ./.hawk
COPY --chown=hawklearn:nodejs scripts/deploy-check.mjs ./scripts/deploy-check.mjs
USER hawklearn
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
