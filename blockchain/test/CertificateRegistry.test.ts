import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { CertificateRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CertificateRegistry", function () {
  let registry: CertificateRegistry;
  let admin: HardhatEthersSigner;
  let issuer1: HardhatEthersSigner;
  let issuer2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  const CERT_ID = "VC-FAMT-CSE-2026-0001";
  const DOC_HASH = "abc123def456abc123def456abc123def456abc123def456abc123def456abc1";
  const IPFS_CID = "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq";

  beforeEach(async function () {
    [admin, issuer1, issuer2, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertificateRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  // Test 1: Admin can add issuer
  it("1. Admin can add an issuer", async function () {
    await expect(registry.connect(admin).addIssuer(issuer1.address))
      .to.emit(registry, "IssuerAdded")
      .withArgs(issuer1.address, admin.address, anyValue);

    expect(await registry.isIssuer(issuer1.address)).to.be.true;
  });

  // Test 2: Admin can remove issuer
  it("2. Admin can remove an issuer", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await expect(registry.connect(admin).removeIssuer(issuer1.address))
      .to.emit(registry, "IssuerRemoved")
      .withArgs(issuer1.address, admin.address, anyValue);

    expect(await registry.isIssuer(issuer1.address)).to.be.false;
  });

  // Test 3: Issuer can issue certificate
  it("3. Issuer can issue a certificate", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);

    await expect(
      registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID)
    )
      .to.emit(registry, "CertificateIssued")
      .withArgs(CERT_ID, DOC_HASH, issuer1.address, anyValue);

    const cert = await registry.getCertificate(CERT_ID);
    expect(cert.certificateId).to.equal(CERT_ID);
    expect(cert.documentHash).to.equal(DOC_HASH);
    expect(cert.issuer).to.equal(issuer1.address);
    expect(cert.status).to.equal(0); // CertificateStatus.ACTIVE
  });

  // Test 4: Unauthorized account cannot issue
  it("4. Unauthorized account cannot issue certificate", async function () {
    await expect(
      registry.connect(stranger).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID)
    ).to.be.reverted;
  });

  // Test 5: Duplicate certificate ID is rejected
  it("5. Duplicate certificate ID is rejected", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID);

    await expect(
      registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID)
    ).to.be.revertedWith("CertificateRegistry: certificate ID already exists");
  });

  // Test 6: Certificate can be revoked
  it("6. Certificate can be revoked by authorized issuer", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID);

    await expect(registry.connect(issuer1).revokeCertificate(CERT_ID))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(CERT_ID, issuer1.address, anyValue);

    const cert = await registry.getCertificate(CERT_ID);
    expect(cert.status).to.equal(1); // CertificateStatus.REVOKED
  });

  // Test 7: Revoked certificate is invalid
  it("7. Revoked certificate is marked invalid", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID);
    await registry.connect(issuer1).revokeCertificate(CERT_ID);

    expect(await registry.isCertificateValid(CERT_ID)).to.be.false;
  });

  // Test 8: Certificate data can be retrieved
  it("8. Certificate data can be retrieved correctly", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID);

    const cert = await registry.getCertificate(CERT_ID);
    expect(cert.certificateId).to.equal(CERT_ID);
    expect(cert.documentHash).to.equal(DOC_HASH);
    expect(cert.ipfsCID).to.equal(IPFS_CID);
    expect(cert.issuer).to.equal(issuer1.address);
    expect(await registry.isCertificateValid(CERT_ID)).to.be.true;
    expect(await registry.certificateExists(CERT_ID)).to.be.true;
  });

  // Bonus: Unauthorized revocation
  it("9. Stranger cannot revoke certificate", async function () {
    await registry.connect(admin).addIssuer(issuer1.address);
    await registry.connect(issuer1).issueCertificate(CERT_ID, DOC_HASH, IPFS_CID);

    await expect(
      registry.connect(stranger).revokeCertificate(CERT_ID)
    ).to.be.reverted;
  });

  // Bonus: Non-existent certificate
  it("10. Non-existent certificate is not valid", async function () {
    expect(await registry.isCertificateValid("VC-FAKE-0000")).to.be.false;
    expect(await registry.certificateExists("VC-FAKE-0000")).to.be.false;
  });
});

async function getTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block?.timestamp ?? 0;
}
