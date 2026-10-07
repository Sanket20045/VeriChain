// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CertificateRegistry
 * @notice VeriChain — College Certificate Registry on EVM
 * @dev Manages college certificate issuance, revocation, and verification.
 *      Stores only the minimum metadata required for cryptographic verification.
 *      Large certificate files are stored off-chain (IPFS).
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE → College Administrator
 *   ISSUER_ROLE        → Authorized faculty / department staff
 */
contract CertificateRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum CertificateStatus {
        ACTIVE,
        REVOKED
    }

    struct Certificate {
        string certificateId;   // e.g. "VC-FAMT-CSE-2026-0001"
        string documentHash;    // SHA-256 of the certificate file (hex string)
        address issuer;         // Issuer's wallet address
        uint256 issueTimestamp; // Unix timestamp of issuance
        CertificateStatus status;
        string ipfsCID;         // IPFS Content ID (can be empty during local dev)
    }

    // certificateId → Certificate
    mapping(string => Certificate) private _certificates;
    // Track which certificate IDs exist (prevent duplicates)
    mapping(string => bool) private _exists;

    // Events
    event IssuerAdded(address indexed issuer, address indexed addedBy, uint256 timestamp);
    event IssuerRemoved(address indexed issuer, address indexed removedBy, uint256 timestamp);
    event CertificateIssued(
        string indexed certificateId,
        string documentHash,
        address indexed issuer,
        uint256 timestamp
    );
    event CertificateRevoked(
        string indexed certificateId,
        address indexed revokedBy,
        uint256 timestamp
    );

    /**
     * @dev Constructor grants deployer both DEFAULT_ADMIN_ROLE and ISSUER_ROLE.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    // ─── Admin Functions ───────────────────────────────────────────────

    /**
     * @notice Add a new authorized issuer.
     * @param issuerAddress Wallet address of the new issuer.
     */
    function addIssuer(address issuerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(issuerAddress != address(0), "CertificateRegistry: zero address");
        require(!hasRole(ISSUER_ROLE, issuerAddress), "CertificateRegistry: already an issuer");
        _grantRole(ISSUER_ROLE, issuerAddress);
        emit IssuerAdded(issuerAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Remove an authorized issuer.
     * @param issuerAddress Wallet address of the issuer to remove.
     */
    function removeIssuer(address issuerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(ISSUER_ROLE, issuerAddress), "CertificateRegistry: not an issuer");
        require(issuerAddress != msg.sender, "CertificateRegistry: cannot remove self");
        _revokeRole(ISSUER_ROLE, issuerAddress);
        emit IssuerRemoved(issuerAddress, msg.sender, block.timestamp);
    }

    // ─── Certificate Functions ─────────────────────────────────────────

    /**
     * @notice Issue a new certificate on-chain.
     * @param certificateId  Unique certificate identifier.
     * @param documentHash   SHA-256 hash of the certificate file.
     * @param ipfsCID        IPFS CID of the certificate file (can be empty).
     */
    function issueCertificate(
        string calldata certificateId,
        string calldata documentHash,
        string calldata ipfsCID
    ) external onlyRole(ISSUER_ROLE) nonReentrant {
        require(bytes(certificateId).length > 0, "CertificateRegistry: empty certificate ID");
        require(bytes(documentHash).length > 0, "CertificateRegistry: empty document hash");
        require(!_exists[certificateId], "CertificateRegistry: certificate ID already exists");

        _certificates[certificateId] = Certificate({
            certificateId: certificateId,
            documentHash: documentHash,
            issuer: msg.sender,
            issueTimestamp: block.timestamp,
            status: CertificateStatus.ACTIVE,
            ipfsCID: ipfsCID
        });
        _exists[certificateId] = true;

        emit CertificateIssued(certificateId, documentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Revoke an existing certificate.
     * @param certificateId The ID of the certificate to revoke.
     */
    function revokeCertificate(string calldata certificateId)
        external
        onlyRole(ISSUER_ROLE)
        nonReentrant
    {
        require(_exists[certificateId], "CertificateRegistry: certificate not found");
        require(
            _certificates[certificateId].status == CertificateStatus.ACTIVE,
            "CertificateRegistry: certificate already revoked"
        );

        _certificates[certificateId].status = CertificateStatus.REVOKED;

        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }

    // ─── View Functions ────────────────────────────────────────────────

    /**
     * @notice Retrieve certificate metadata.
     * @param certificateId The ID of the certificate.
     * @return A Certificate struct with all fields.
     */
    function getCertificate(string calldata certificateId)
        external
        view
        returns (Certificate memory)
    {
        require(_exists[certificateId], "CertificateRegistry: certificate not found");
        return _certificates[certificateId];
    }

    /**
     * @notice Check if a certificate is valid (exists and not revoked).
     * @param certificateId The ID of the certificate.
     * @return True if the certificate is active.
     */
    function isCertificateValid(string calldata certificateId) external view returns (bool) {
        if (!_exists[certificateId]) return false;
        return _certificates[certificateId].status == CertificateStatus.ACTIVE;
    }

    /**
     * @notice Check if an address is an authorized issuer.
     * @param account The wallet address to check.
     * @return True if the address has ISSUER_ROLE.
     */
    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    /**
     * @notice Check if a certificate ID has been registered.
     * @param certificateId The ID to check.
     * @return True if the certificate exists.
     */
    function certificateExists(string calldata certificateId) external view returns (bool) {
        return _exists[certificateId];
    }
}
