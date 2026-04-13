import { BrowserProvider, keccak256, toUtf8Bytes } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export interface BlockchainAnchorResult {
  txHash: string;
  payloadHash: string;
}

export async function anchorAuditHashOnHoodi(params: {
  eventType: string;
  referenceId: string;
  payload: unknown;
}): Promise<BlockchainAnchorResult> {
  if (!window.ethereum) {
    throw new Error("Wallet not found. Install MetaMask to anchor on Hoodi.");
  }

  const configuredChainHex = import.meta.env.VITE_HOODI_CHAIN_ID_HEX;
  if (configuredChainHex) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: configuredChainHex }],
      });
    } catch {
      // Continue with connected network if switch fails.
    }
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();

  const auditPayload = {
    eventType: params.eventType,
    referenceId: params.referenceId,
    timestamp: new Date().toISOString(),
    payload: params.payload,
  };
  const payloadHash = keccak256(toUtf8Bytes(JSON.stringify(auditPayload)));

  const receiver = import.meta.env.VITE_HOODI_AUDIT_RECEIVER_ADDRESS || signerAddress;
  const tx = await signer.sendTransaction({
    to: receiver,
    value: 0n,
    data: payloadHash,
  });
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash ?? tx.hash,
    payloadHash,
  };
}
