import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from "ethers";
import { LIT_ABILITY, LIT_NETWORK, LIT_RPC } from '@lit-protocol/constants';
import type { AuthSig, MintCapacityCreditsRes, SessionSigsMap } from '@lit-protocol/types';
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { api, type GeneratePrivateKeyResult } from "@lit-protocol/wrapped-keys";

const { generatePrivateKey } = api;

export type LIT_NETWORKS_KEYS = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

/**
 * Creates a new Lit Protocol node client
 * @param network The network to connect to
 * @param debug Whether to enable debug mode
 * @returns A new instance of LitNodeClient
 */
export async function createLitNodeClient(network: LIT_NETWORKS_KEYS, debug: boolean = false): Promise<LitNodeClient> {
    const litNodeClient = new LitNodeClient({
        litNetwork: network,
        debug,
    });
    await litNodeClient.connect();
    return litNodeClient;
}

export async function createLitContractsClient(ethersWallet: ethers.Wallet, network: LIT_NETWORKS_KEYS): Promise<LitContracts> {
    const litContractClient = new LitContracts({
      signer: ethersWallet,
      network,
    });
    await litContractClient.connect();
    return litContractClient;
}

export function createEthersWallet(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(
        privateKey,
        new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
}

/**
 * Mints a new Lit Protocol capacity credit
 * @param params Parameters for minting capacity credit
 * @returns Information about the minted capacity credit
 * 
 * @todo Add check that daysUntilUTCMidnightExpiration is not more than 30
 */
export async function mintCapacityCredit(litContractClient: LitContracts, requestsPerSecond: number, daysUntilUTCMidnightExpiration: number): Promise<MintCapacityCreditsRes> {
    return litContractClient.mintCapacityCreditsNFT({
      requestsPerSecond: requestsPerSecond,
      daysUntilUTCMidnightExpiration: daysUntilUTCMidnightExpiration,
    });
}

export async function createCapacityCreditDelegationAuthSig(litNodeClient: LitNodeClient, ethersWallet: ethers.Wallet, capacityTokenId: string, pkpEthAddress: string): Promise<AuthSig> {
    const { capacityDelegationAuthSig } = await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersWallet,
      capacityTokenId,
      delegateeAddresses: [pkpEthAddress],
      uses: "2",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });

    return capacityDelegationAuthSig;
};

/**
 * Mints a new PKP (Programmable Key Pair)
 * @param params Parameters for minting PKP
 * @returns Information about the minted PKP
 */
export async function mintPKP(litContractClient: LitContracts): Promise<{
    tokenId: any;
    publicKey: string;
    ethAddress: string;
}> {
    return (await litContractClient.pkpNftContractUtils.write.mint()).pkp;
}

export async function getPKPSessionSigs(litNodeClient: LitNodeClient, pkpPublicKey: string, pkpEthAddress: string, ethersWallet: ethers.Wallet, capacityTokenId: string): Promise<SessionSigsMap> {
    return litNodeClient.getPkpSessionSigs({
      pkpPublicKey,
      capabilityAuthSigs: [
        await createCapacityCreditDelegationAuthSig(
          litNodeClient,
          ethersWallet,
          capacityTokenId,
          pkpEthAddress,
        ),
      ],
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: ethersWallet,
          litNodeClient,
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
            resource: new LitActionResource('*'),
            ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    });
}

/**
 * Generates a new wrapped key associated with a PKP
 * @param params Parameters for generating wrapped key
 * @returns Information about the generated wrapped key
 */
export async function generateWrappedKey(litNodeClient: LitNodeClient, pkpSessionSigs: SessionSigsMap, network: "evm" | "solana", memo?: string): Promise<GeneratePrivateKeyResult> {
    return generatePrivateKey({
        litNodeClient,
        pkpSessionSigs,
        network,
        memo: memo ?? "This is a wrapped key generated by the Lit Goat Wallet Client",
    });
}
