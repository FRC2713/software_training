# syntax=docker/dockerfile:1
FROM python:3.12-slim

ARG APP_REVISION=development
ENV APP_REVISION=${APP_REVISION}
LABEL org.opencontainers.image.revision=${APP_REVISION}

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=4000

WORKDIR /opt/runner
COPY runner/maze_solver.py runner/maze_driver.py runner/server.py ./
RUN chmod 0555 /opt/runner && chmod 0444 /opt/runner/*.py

USER 65534:65534
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:4000/health', timeout=2)"

CMD ["python3", "-I", "/opt/runner/server.py"]
