# DBBackup - Database Backup Management Platform

A modern, full-featured database backup management platform with support for MySQL, PostgreSQL, and MongoDB.

## Features

- **Multi-Database Support**: MySQL, PostgreSQL, MongoDB
- **Scheduled Backups**: Cron-based backup scheduling
- **Multiple Storage Options**: Local, S3, MinIO, SFTP
- **Backup Encryption**: AES-256 encryption
- **Compression**: Automatic backup compression
- **Point-in-Time Recovery**: Restore to any point in time
- **Web Dashboard**: Modern React-based UI
- **RESTful API**: Complete API for automation
- **Monitoring**: Real-time backup status and alerts

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-org/dbbackup.git
cd dbbackup

# Start with Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Or with full stack (includes MinIO and test databases)
docker-compose -f docker/docker-compose.full.yml up -d
```

The application will be available at:
- Web UI: http://localhost:3001
- API: http://localhost:3001/api/v1
- API Docs: http://localhost:3001/api/docs

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | PostgreSQL username | postgres |
| `DB_PASSWORD` | PostgreSQL password | postgres |
| `DB_NAME` | PostgreSQL database | dbbackup |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `ENCRYPTION_KEY` | Backup encryption key | required |
| `BACKUP_DIR` | Local backup directory | /app/backups |

## API Endpoints

### Databases
- `GET /api/v1/databases` - List all databases
- `POST /api/v1/databases` - Add database
- `PUT /api/v1/databases/:id` - Update database
- `DELETE /api/v1/databases/:id` - Delete database
- `POST /api/v1/databases/test-connection` - Test connection

### Backups
- `GET /api/v1/backups` - List backups
- `POST /api/v1/backups` - Create backup
- `DELETE /api/v1/backups/:id` - Delete backup
- `GET /api/v1/backups/:id/download` - Download backup
- `POST /api/v1/backups/:id/verify` - Verify backup

### Restore
- `GET /api/v1/restore` - List restore logs
- `POST /api/v1/restore` - Restore backup

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Run Development Servers

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

## License

MIT
