import type {
    LitEVMWalletClient,
    LitEVMWalletOptions,
    LitSolanaWalletOptions,
    SolanaWalletClient,
} from "@goat-sdk/core";
import { createEVMWallet } from "./evm";
import { createSolanaWallet } from "./solana";

export function lit(options: LitEVMWalletOptions): LitEVMWalletClient;
export function lit(options: LitSolanaWalletOptions): SolanaWalletClient;
export function lit(options: LitEVMWalletOptions | LitSolanaWalletOptions): LitEVMWalletClient | SolanaWalletClient {
    if (options.network === "evm") {
        return createEVMWallet(options);
    } else {
        return createSolanaWallet(options);
    }
}

export * from "./setup";
