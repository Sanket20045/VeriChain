"""
Blockchain service — connects to the CertificateRegistry smart contract.
Handles: certificate lookup, issuance, revocation.
"""
import os
import json
from pathlib import Path
from typing import Optional, Any
from web3 import AsyncWeb3, AsyncHTTPProvider
from web3.contract import AsyncContract
from eth_account import Account

RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
ABI_PATH = os.getenv("ABI_PATH", "../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json")


class BlockchainService:
    def __init__(self):
        self.w3: Optional[AsyncWeb3] = None
        self.contract: Optional[AsyncContract] = None

    async def connect(self):
        """Connect to blockchain and load contract."""
        self.w3 = AsyncWeb3(AsyncHTTPProvider(RPC_URL))
        connected = await self.w3.is_connected()
        if not connected:
            raise ConnectionError(f"Cannot connect to blockchain at {RPC_URL}")

        if CONTRACT_ADDRESS and os.path.exists(ABI_PATH):
            with open(ABI_PATH) as f:
                artifact = json.load(f)
            abi = artifact.get("abi", artifact)
            self.contract = self.w3.eth.contract(
                address=AsyncWeb3.to_checksum_address(CONTRACT_ADDRESS),
                abi=abi,
            )

    async def get_certificate(self, certificate_id: str) -> Optional[dict]:
        """Fetch certificate record from blockchain."""
        if not self.contract:
            return None
        try:
            result = await self.contract.functions.getCertificate(certificate_id).call()
            # Unpack struct: (certificateId, documentHash, issuer, issueTimestamp, status, ipfsCID)
            if not result or result[0] == "":
                return None
            return {
                "certificate_id": result[0],
                "document_hash": result[1],
                "issuer": result[2],
                "issue_timestamp": result[3],
                "status": result[4],  # 0=ACTIVE, 1=REVOKED
                "ipfs_cid": result[5],
            }
        except Exception as e:
            print(f"[Blockchain] getCertificate error: {e}")
            return None

    async def is_issuer(self, wallet_address: str) -> bool:
        """Check if wallet is an authorized issuer."""
        if not self.contract:
            return False
        try:
            return await self.contract.functions.isIssuer(
                AsyncWeb3.to_checksum_address(wallet_address)
            ).call()
        except Exception:
            return False

    async def is_certificate_valid(self, certificate_id: str) -> bool:
        """Check if certificate is valid on chain."""
        if not self.contract:
            return False
        try:
            return await self.contract.functions.isCertificateValid(certificate_id).call()
        except Exception:
            return False


# Global singleton
blockchain_service = BlockchainService()


async def get_blockchain_service() -> BlockchainService:
    """FastAPI dependency to get blockchain service."""
    if not blockchain_service.w3:
        try:
            await blockchain_service.connect()
        except Exception as e:
            print(f"[Blockchain] Connection warning: {e}")
    return blockchain_service
