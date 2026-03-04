# BuildAI Agent

BuildAI Agent runs on managed servers and communicates with the Controller.

## Features

- Docker container management
- Command execution
- Log streaming
- System metrics collection
- Secure mTLS communication

## Configuration

Environment variables:
- `AGENT_TOKEN` - Authentication token
- `CONTROLLER_URL` - Controller WebSocket URL
- `NODE_ID` - Unique node identifier
- `PORT` - HTTP server port (default: 8081)

## Build

```bash
go build -o buildai-agent main.go
```

## Run

```bash
./buildai-agent
```
