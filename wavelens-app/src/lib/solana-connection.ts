import { Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, generateSigner, publicKey } from '@metaplex-foundation/umi';
import { create, fetchAssetV1, mplCore } from '@metaplex-foundation/mpl-core';
import type { SolanaReceiptData } from './solana-utils';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Solana Metaplex Core integration for WaveLens.
 *
 * Mints a non-transferable Metaplex Core asset for each demo session as a
 * "Safety Pass" receipt. The Demo MVP stores only the hash and summary
 * attributes on-chain; raw transcripts are not uploaded by this app.
 */

const DEVNET_RPC = 'https://api.devnet.solana.com';

function getKeypair(): Keypair {
  if (process.env.SOLANA_PRIVATE_KEY) {
    const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
    return Keypair.fromSecretKey(secretKey);
  }

  const keypairPath = path.join(process.cwd(), '.solana-keypair.json');
  if (fs.existsSync(keypairPath)) {
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
    return Keypair.fromSecretKey(secretKey);
  }

  const kp = Keypair.generate();
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

/**
 * Initialize UMI with our custodial keypair
 */
function getUmi() {
  const umi = createUmi(DEVNET_RPC);
  const kp = getKeypair();
  
  // Convert web3.js keypair to UMI keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
  umi.use(mplCore());
  umi.use(keypairIdentity(umiKeypair));
  
  return umi;
}

/**
 * Record an audit receipt using Metaplex Core Soulbound NFTs.
 * For the hackathon, we mint a new Safety Record NFT per session for simplicity,
 * or update an existing one if worker NFT PDA is implemented.
 */
export async function recordReceipt(data: SolanaReceiptData): Promise<string> {
  const umi = getUmi();
  
  // Create a new asset signer for this session's Safety Pass
  const asset = generateSigner(umi);

  console.log(`[Solana] Minting Metaplex Core Safety Pass for ${data.hash.substring(0, 8)}...`);

  await create(umi, {
    asset,
    name: "WaveLens Safety Pass",
    uri: '',
    plugins: [
      {
        type: 'PermanentFreezeDelegate',
        frozen: true,
        authority: { type: 'None' }, // Soulbound - cannot be transferred
      },
      {
        type: 'Attributes',
        attributeList: [
          { key: 'domain', value: data.domain },
          { key: 'channel', value: data.channelName },
          { key: 'latest_audit_hash', value: data.hash },
          { key: 'timestamp', value: data.timestamp.toString() },
          { key: 'message_count', value: data.messageCount.toString() },
        ],
      },
    ],
  }).sendAndConfirm(umi);

  // Return the asset address
  console.log(`[Solana] Safety Pass minted! Asset ID: ${asset.publicKey.toString()}`);
  
  return asset.publicKey.toString();
}

/**
 * Verify a receipt by fetching the Core Asset and checking its attributes
 */
export async function verifyReceipt(assetAddress: string): Promise<SolanaReceiptData | null> {
  try {
    const umi = getUmi();
    const asset = await fetchAssetV1(umi, publicKey(assetAddress));
    
    // @ts-expect-error AssetV1 type incomplete in Umi
    const attrsPlugin = asset.pluginList?.find((p: any) => p.type === 'Attributes') || asset.plugins?.find((p: any) => p.type === 'Attributes');
    if (!attrsPlugin || attrsPlugin.type !== 'Attributes') return null;
    
    const attrs = attrsPlugin.attributeList;
    const attrValue = (key: string) => attrs.find((a: any) => a.key === key)?.value ?? '';
    
    return {
      hash: attrValue('latest_audit_hash'),
      timestamp: parseInt(attrValue('timestamp') || '0', 10),
      channelName: attrValue('channel'),
      domain: attrValue('domain'),
      messageCount: parseInt(attrValue('message_count') || '0', 10),
    };
  } catch (err) {
    console.error('[Solana] Verify failed:', err);
    return null;
  }
}
