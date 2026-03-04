module server

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/gorilla/websocket v1.5.1
	github.com/docker/docker v24.0.7+incompatible
	github.com/docker/go-connections v0.4.0
	github.com/golang-jwt/jwt/v5 v5.2.0
	github.com/spf13/viper v1.18.2
	go.uber.org/zap v1.26.0
	golang.org/x/crypto v0.18.0
	gorm.io/driver/postgres v1.5.4
	gorm.io/gorm v1.25.5
)
