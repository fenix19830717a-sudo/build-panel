# Polymarket Trading Bot Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY setup.py setup.cfg ./
COPY src/ ./src/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy configuration
COPY config.yaml ./

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs /app/.keys

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src

# Expose ports for API and metrics
EXPOSE 8000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the bot
CMD ["python", "src/main.py"]
