# syntax=docker/dockerfile:1
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Runner stage
FROM python:3.11-slim

WORKDIR /app

# Non-root user for container security
RUN groupadd -r medinvedic && useradd -r -g medinvedic medinvedic

COPY --from=builder /root/.local /home/medinvedic/.local
COPY main.py .

ENV PATH=/home/medinvedic/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=8080

USER medinvedic

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

CMD ["python", "main.py"]
