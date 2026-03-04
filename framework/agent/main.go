package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Agent struct {
	client     *client.Client
	token      string
	controller string
	nodeID     string
}

type SystemInfo struct {
	Hostname   string `json:"hostname"`
	OS         string `json:"os"`
	Arch       string `json:"arch"`
	CPUCores   int    `json:"cpu_cores"`
	MemoryGB   int    `json:"memory_gb"`
	DiskGB     int    `json:"disk_gb"`
	DockerVersion string `json:"docker_version"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func NewAgent() (*Agent, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &Agent{
		client:     cli,
		token:      os.Getenv("AGENT_TOKEN"),
		controller: os.Getenv("CONTROLLER_URL"),
		nodeID:     os.Getenv("NODE_ID"),
	}, nil
}

func (a *Agent) GetSystemInfo() (*SystemInfo, error) {
	hostname, _ := os.Hostname()
	
	info := &SystemInfo{
		Hostname: hostname,
		OS:       runtime.GOOS,
		Arch:     runtime.GOARCH,
	}

	// Get Docker version
	version, err := a.client.ServerVersion(context.Background())
	if err == nil {
		info.DockerVersion = version.Version
	}

	return info, nil
}

func (a *Agent) ExecuteCommand(command string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "sh", "-c", command)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func (a *Agent) DeployContainer(image string, name string, ports map[string]string, env []string) (string, error) {
	ctx := context.Background()

	// Pull image
	reader, err := a.client.ImagePull(ctx, image, types.ImagePullOptions{})
	if err != nil {
		return "", err
	}
	defer reader.Close()

	// Wait for pull to complete
	buf := make([]byte, 1024)
	for {
		_, err := reader.Read(buf)
		if err != nil {
			break
		}
	}

	// Create container config
	config := &container.Config{
		Image: image,
		Env:   env,
	}

	// Port bindings
	portBindings := nat.PortMap{}
	for containerPort, hostPort := range ports {
		portBindings[nat.Port(containerPort)] = []nat.PortBinding{
			{HostPort: hostPort},
		}
	}

	hostConfig := &container.HostConfig{
		PortBindings: portBindings,
		RestartPolicy: container.RestartPolicy{
			Name: "always",
		},
	}

	// Create container
	resp, err := a.client.ContainerCreate(ctx, config, hostConfig, nil, nil, name)
	if err != nil {
		return "", err
	}

	// Start container
	if err := a.client.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	return resp.ID, nil
}

func (a *Agent) GetContainerStatus(containerID string) (types.ContainerJSON, error) {
	ctx := context.Background()
	return a.client.ContainerInspect(ctx, containerID)
}

func (a *Agent) StreamLogs(containerID string, w http.ResponseWriter) error {
	ctx := context.Background()
	options := types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Tail:       "100",
	}

	reader, err := a.client.ContainerLogs(ctx, containerID, options)
	if err != nil {
		return err
	}
	defer reader.Close()

	// Stream to response
	buf := make([]byte, 1024)
	for {
		n, err := reader.Read(buf)
		if n > 0 {
			w.Write(buf[:n])
			w.(http.Flusher).Flush()
		}
		if err != nil {
			break
		}
	}
	return nil
}

func main() {
	agent, err := NewAgent()
	if err != nil {
		log.Fatal("Failed to create agent:", err)
	}

	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// System info
	r.GET("/api/v1/system/info", func(c *gin.Context) {
		info, err := agent.GetSystemInfo()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, info)
	})

	// Execute command
	r.POST("/api/v1/exec", func(c *gin.Context) {
		var req struct {
			Command string `json:"command"`
		}
		if err := c.BindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		output, err := agent.ExecuteCommand(req.Command)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error(), "output": output})
			return
		}
		c.JSON(200, gin.H{"output": output})
	})

	// Deploy container
	r.POST("/api/v1/containers/deploy", func(c *gin.Context) {
		var req struct {
			Image string            `json:"image"`
			Name  string            `json:"name"`
			Ports map[string]string `json:"ports"`
			Env   []string          `json:"env"`
		}
		if err := c.BindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		containerID, err := agent.DeployContainer(req.Image, req.Name, req.Ports, req.Env)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"container_id": containerID})
	})

	// Get container status
	r.GET("/api/v1/containers/:id/status", func(c *gin.Context) {
		id := c.Param("id")
		status, err := agent.GetContainerStatus(id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, status)
	})

	// Stream logs
	r.GET("/api/v1/containers/:id/logs", func(c *gin.Context) {
		id := c.Param("id")
		c.Header("Content-Type", "text/plain")
		c.Header("Transfer-Encoding", "chunked")
		
		if err := agent.StreamLogs(id, c.Writer); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Agent starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start agent:", err)
	}
}
