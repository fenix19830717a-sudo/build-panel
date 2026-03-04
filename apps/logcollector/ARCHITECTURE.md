# LogCollector Application

## Overview
LogCollector is a centralized log collection and analysis platform built with NestJS and React.

## Features
- Log collection via Syslog, Filebeat, Fluentd, HTTP, TCP, UDP
- Full-text search with PostgreSQL
- Real-time log streaming via WebSocket
- Custom log parsing rules
- Alert rules with notifications
- Interactive dashboard with charts

## AI API Endpoints
- `POST /api/v1/logs/ingest` - Ingest logs from external sources
- `GET /api/v1/logs/search` - Search logs with filters
- `GET /api/v1/logs/stats` - Get log statistics
- `POST /api/v1/logs/query` - Execute custom SQL queries

## Quick Start

### Docker Compose
```bash
cd docker
docker-compose up -d
```

### Manual Setup
```bash
# Start database
docker run -d --name logcollector-db \
  -e POSTGRES_USER=logcollector \
  -e POSTGRES_PASSWORD=logcollector123 \
  -e POSTGRES_DB=logcollector \
  -p 5432:5432 \
  postgres:16-alpine

# Start backend
cd backend
npm install
npm run start:dev

# Start frontend
cd frontend
npm install
npm run dev
```

## Architecture
- **Backend**: NestJS + TypeORM + PostgreSQL + WebSocket
- **Frontend**: React + Vite + Ant Design + Ant Design Charts
- **Database**: PostgreSQL with JSONB for metadata
