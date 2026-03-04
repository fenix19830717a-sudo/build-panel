"""
Wallet management module with encrypted private key storage
"""
import os
import json
from pathlib import Path
from typing import Optional, Dict
from decimal import Decimal
from dataclasses import dataclass

from web3 import Web3
from eth_account import Account
from cryptography.fernet import Fernet
from loguru import logger

from ..models import WalletInfo, Balance
from ..utils import validate_address, wei_to_decimal


@dataclass
class EncryptedKey:
    """Encrypted key data"""
    encrypted_private_key: str
    address: str
    salt: str


class WalletManager:
    """Manager for wallet operations with encrypted key storage"""
    
    # USDC contract on Polygon
    USDC_CONTRACT = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    USDC_DECIMALS = 6
    
    # Minimal ERC20 ABI for balance checking
    ERC20_ABI = [
        {
            "constant": True,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function"
        },
        {
            "constant": True,
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "type": "function"
        }
    ]
    
    def __init__(self, rpc_url: str, encryption_key_path: str = "./.keys/encryption.key"):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.encryption_key_path = Path(encryption_key_path)
        self._encryption_key: Optional[bytes] = None
        self._account: Optional[Account] = None
        self._address: Optional[str] = None
        
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key"""
        if self._encryption_key:
            return self._encryption_key
            
        if self.encryption_key_path.exists():
            with open(self.encryption_key_path, "rb") as f:
                self._encryption_key = f.read()
        else:
            self.encryption_key_path.parent.mkdir(parents=True, exist_ok=True)
            self._encryption_key = Fernet.generate_key()
            with open(self.encryption_key_path, "wb") as f:
                f.write(self._encryption_key)
            logger.info(f"Generated new encryption key at {self.encryption_key_path}")
        
        return self._encryption_key
    
    def _get_fernet(self) -> Fernet:
        """Get Fernet instance"""
        return Fernet(self._get_or_create_encryption_key())
    
    def encrypt_private_key(self, private_key: str) -> EncryptedKey:
        """Encrypt private key and return encrypted data"""
        # Validate private key
        if private_key.startswith("0x"):
            private_key = private_key[2:]
        
        account = Account.from_key(private_key)
        address = account.address
        
        fernet = self._get_fernet()
        encrypted = fernet.encrypt(private_key.encode()).decode()
        salt = os.urandom(16).hex()
        
        return EncryptedKey(
            encrypted_private_key=encrypted,
            address=address,
            salt=salt
        )
    
    def decrypt_private_key(self, encrypted_key: EncryptedKey) -> str:
        """Decrypt private key"""
        fernet = self._get_fernet()
        decrypted = fernet.decrypt(encrypted_key.encrypted_private_key.encode())
        return decrypted.decode()
    
    def load_wallet(self, encrypted_key_data: Dict) -> bool:
        """Load wallet from encrypted key data"""
        try:
            encrypted_key = EncryptedKey(
                encrypted_private_key=encrypted_key_data["encrypted_private_key"],
                address=encrypted_key_data["address"],
                salt=encrypted_key_data.get("salt", "")
            )
            
            private_key = self.decrypt_private_key(encrypted_key)
            self._account = Account.from_key(private_key)
            self._address = self._account.address
            
            logger.info(f"Wallet loaded: {self._address}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load wallet: {e}")
            return False
    
    def create_wallet(self) -> EncryptedKey:
        """Create new wallet"""
        account = Account.create()
        return self.encrypt_private_key(account.key.hex())
    
    def import_wallet(self, private_key: str) -> EncryptedKey:
        """Import wallet from private key"""
        return self.encrypt_private_key(private_key)
    
    @property
    def address(self) -> Optional[str]:
        """Get wallet address"""
        return self._address
    
    @property
    def is_loaded(self) -> bool:
        """Check if wallet is loaded"""
        return self._account is not None
    
    def get_usdc_balance(self) -> Decimal:
        """Get USDC balance"""
        if not self._address:
            raise ValueError("Wallet not loaded")
        
        try:
            contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.USDC_CONTRACT),
                abi=self.ERC20_ABI
            )
            balance = contract.functions.balanceOf(self._address).call()
            return wei_to_decimal(balance, self.USDC_DECIMALS)
        except Exception as e:
            logger.error(f"Failed to get USDC balance: {e}")
            return Decimal("0")
    
    def get_native_balance(self) -> Decimal:
        """Get native token (MATIC) balance"""
        if not self._address:
            raise ValueError("Wallet not loaded")
        
        try:
            balance = self.w3.eth.get_balance(self._address)
            return self.w3.from_wei(balance, "ether")
        except Exception as e:
            logger.error(f"Failed to get native balance: {e}")
            return Decimal("0")
    
    def get_wallet_info(self) -> WalletInfo:
        """Get complete wallet info"""
        if not self._address:
            raise ValueError("Wallet not loaded")
        
        usdc_balance = self.get_usdc_balance()
        matic_balance = self.get_native_balance()
        
        return WalletInfo(
            address=self._address,
            balances=[
                Balance(asset="USDC", free=usdc_balance, locked=Decimal("0"), total=usdc_balance),
                Balance(asset="MATIC", free=matic_balance, locked=Decimal("0"), total=matic_balance)
            ],
            nonce=self.w3.eth.get_transaction_count(self._address),
            chain_id=self.w3.eth.chain_id
        )
    
    def sign_message(self, message: str) -> str:
        """Sign a message"""
        if not self._account:
            raise ValueError("Wallet not loaded")
        
        message_hash = self.w3.keccak(text=message)
        signed = self._account.signHash(message_hash)
        return signed.signature.hex()
    
    def sign_transaction(self, transaction_dict: Dict) -> str:
        """Sign a transaction"""
        if not self._account:
            raise ValueError("Wallet not loaded")
        
        signed = self._account.sign_transaction(transaction_dict)
        return signed.rawTransaction.hex()


class WalletStorage:
    """Storage for encrypted wallet data"""
    
    def __init__(self, storage_path: str = "./.keys/wallet.json"):
        self.storage_path = Path(storage_path)
    
    def save(self, encrypted_key: EncryptedKey, name: str = "default"):
        """Save encrypted wallet"""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {}
        if self.storage_path.exists():
            with open(self.storage_path, "r") as f:
                data = json.load(f)
        
        data[name] = {
            "encrypted_private_key": encrypted_key.encrypted_private_key,
            "address": encrypted_key.address,
            "salt": encrypted_key.salt
        }
        
        with open(self.storage_path, "w") as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Wallet saved: {encrypted_key.address}")
    
    def load(self, name: str = "default") -> Optional[Dict]:
        """Load encrypted wallet data"""
        if not self.storage_path.exists():
            return None
        
        with open(self.storage_path, "r") as f:
            data = json.load(f)
        
        return data.get(name)
    
    def list_wallets(self) -> list:
        """List all stored wallets"""
        if not self.storage_path.exists():
            return []
        
        with open(self.storage_path, "r") as f:
            data = json.load(f)
        
        return [{"name": name, "address": info["address"]} 
                for name, info in data.items()]
    
    def delete(self, name: str = "default") -> bool:
        """Delete a stored wallet"""
        if not self.storage_path.exists():
            return False
        
        with open(self.storage_path, "r") as f:
            data = json.load(f)
        
        if name in data:
            del data[name]
            with open(self.storage_path, "w") as f:
                json.dump(data, f, indent=2)
            logger.info(f"Wallet deleted: {name}")
            return True
        return False
