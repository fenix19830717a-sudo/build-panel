#!/bin/bash

# Polymarket Bot startup script

set -e

echo "==================================="
echo "Polymarket Trading Bot"
echo "==================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -e .

# Check if config exists
if [ ! -f "config.yaml" ]; then
    echo "Warning: config.yaml not found. Using default configuration."
fi

# Create necessary directories
mkdir -p logs data .keys

echo ""
echo "Starting Polymarket Bot..."
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""

# Run the bot
python src/main.py
