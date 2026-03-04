# BuildAI Agent Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o buildai-agent main.go

# Production stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/buildai-agent .

EXPOSE 8081

CMD ["./buildai-agent"]
