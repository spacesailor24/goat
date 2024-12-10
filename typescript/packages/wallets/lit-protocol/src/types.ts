import { LitNodeClient } from "@lit-protocol/lit-node-client";
import type { SessionSigsMap } from "@lit-protocol/types";
import type { StoredKeyData } from "@lit-protocol/wrapped-keys";
import { type WalletClient } from "viem";

export type LitWalletOptions = {
    litNodeClient: LitNodeClient;
    pkpSessionSigs: SessionSigsMap;
    wrappedKeyMetadata: StoredKeyData & { ethAddress: `0x${string}` };
};

export type LitEVMWalletOptions = LitWalletOptions & {
    network: "evm";
    chainId: number;
    // https://github.com/LIT-Protocol/js-sdk/blob/master/packages/constants/src/lib/constants/constants.ts#L48
    litEVMChainIdentifier: string;
    viemWalletClient: WalletClient;
};
 
export type LitSolanaWalletOptions = LitWalletOptions & {
    network: "solana";
};
