"""
Utility functions for Polymarket Bot
"""
import os
import yaml
import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path
from loguru import logger


def load_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    """Load configuration from YAML file"""
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    with open(path, "r") as f:
        return yaml.safe_load(f)


def save_config(config: Dict[str, Any], config_path: str = "config.yaml"):
    """Save configuration to YAML file"""
    path = Path(config_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(path, "w") as f:
        yaml.dump(config, f, default_flow_style=False)


def format_decimal(value: Decimal, precision: int = 6) -> str:
    """Format decimal with fixed precision"""
    quantize_str = "0." + "0" * precision
    return str(value.quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP))


def decimal_to_wei(value: Decimal, decimals: int = 6) -> int:
    """Convert decimal to wei (for USDC: 6 decimals)"""
    return int(value * Decimal(10 ** decimals))


def wei_to_decimal(value: int, decimals: int = 6) -> Decimal:
    """Convert wei to decimal"""
    return Decimal(value) / Decimal(10 ** decimals)


def generate_id() -> str:
    """Generate unique ID"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    random_suffix = hashlib.md5(os.urandom(16)).hexdigest()[:8]
    return f"{timestamp}_{random_suffix}"


def calculate_pnl(entry_price: Decimal, exit_price: Decimal, 
                  size: Decimal, side: str) -> Decimal:
    """Calculate profit/loss"""
    if side.lower() == "buy":
        return (exit_price - entry_price) * size
    else:
        return (entry_price - exit_price) * size


def safe_divide(numerator: Decimal, denominator: Decimal, 
                default: Decimal = Decimal("0")) -> Decimal:
    """Safe division with default value"""
    try:
        if denominator == 0:
            return default
        return numerator / denominator
    except (ZeroDivisionError, InvalidOperation):
        return default


def setup_logging(config: Dict[str, Any]):
    """Setup logging configuration"""
    log_config = config.get("logging", {})
    level = log_config.get("level", "INFO")
    log_file = log_config.get("file", "logs/polymarket_bot.log")
    
    # Ensure log directory exists
    Path(log_file).parent.mkdir(parents=True, exist_ok=True)
    
    logger.remove()
    logger.add(
        log_file,
        level=level,
        rotation=log_config.get("max_size", "100MB"),
        retention=log_config.get("retention", "30 days"),
        compression="zip",
        enqueue=True
    )
    logger.add(lambda msg: print(msg, end=""), level=level, colorize=True)


def mask_sensitive(value: str, visible_chars: int = 4) -> str:
    """Mask sensitive data like private keys"""
    if len(value) <= visible_chars * 2:
        return "*" * len(value)
    return value[:visible_chars] + "..." + value[-visible_chars:]


def retry_with_backoff(max_retries: int = 3, base_delay: float = 1.0):
    """Decorator for retry logic with exponential backoff"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            import asyncio
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Retry {attempt + 1}/{max_retries} after {delay}s: {e}")
                    await asyncio.sleep(delay)
            return None
        return wrapper
    return decorator


def validate_address(address: str) -> bool:
    """Validate Ethereum address"""
    if not address or not isinstance(address, str):
        return False
    if not address.startswith("0x"):
        return False
    if len(address) != 42:
        return False
    try:
        int(address[2:], 16)
        return True
    except ValueError:
        return False


class RateLimiter:
    """Simple rate limiter using token bucket algorithm"""
    
    def __init__(self, max_requests: int, time_window: float):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
    
    def can_proceed(self) -> bool:
        """Check if request can proceed"""
        now = datetime.utcnow().timestamp()
        # Remove old requests outside time window
        self.requests = [t for t in self.requests if now - t < self.time_window]
        
        if len(self.requests) < self.max_requests:
            self.requests.append(now)
            return True
        return False
    
    def wait_time(self) -> float:
        """Get wait time until next request can be made"""
        if not self.requests:
            return 0.0
        now = datetime.utcnow().timestamp()
        oldest = min(self.requests)
        wait = self.time_window - (now - oldest)
        return max(0.0, wait)


class CircularBuffer:
    """Circular buffer for storing recent data"""
    
    def __init__(self, size: int):
        self.size = size
        self.buffer = []
        self.index = 0
    
    def add(self, item: Any):
        """Add item to buffer"""
        if len(self.buffer) < self.size:
            self.buffer.append(item)
        else:
            self.buffer[self.index] = item
            self.index = (self.index + 1) % self.size
    
    def get_all(self) -> list:
        """Get all items in order"""
        if len(self.buffer) < self.size:
            return self.buffer.copy()
        return self.buffer[self.index:] + self.buffer[:self.index]
    
    def is_full(self) -> bool:
        """Check if buffer is full"""
        return len(self.buffer) == self.size
    
    def clear(self):
        """Clear buffer"""
        self.buffer = []
        self.index = 0
