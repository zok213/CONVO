import { Connection, PublicKey, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js';
import type { SolanaReceiptData } from './solana-utils';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Solana Memo Program integration for WaveLens.
 *
 * Uses the pre-deployed Memo program on devnet to store hash receipts
 * as on-chain memo data. This avoids needing a custom BPF program while
 * still providing an immutable audit trail on Solana.
 *
 * Memo Program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
 *
 * Architecture:
 *   Transaction = 0 SOL transfer (to self as anchor) + Memo (hash + metadata)
 *   Transaction signature serves as the receipt identifier
 *   Verification = fetch tx from devnet, extract memos, parse JSON
 */

// Devnet constant
const DEVNET_RPC = 'https://api.devnet.solana.com';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * Build memo content from receipt data as JSON string.
 */
function buildMemoContent(data: SolanaReceiptData): string {
  return JSON.stringify({
    h: data.hash,
    t: data.timestamp,
    c: data.channelName,
    d: data.domain,
    m: data.messageCount,
  });
}

/**
 * Parse memo content back to receipt data.
 */
function parseMemoContent(memo: string): SolanaReceiptData | null {
  try {
    const parsed = JSON.parse(memo);
    if (!parsed.h || !parsed.t) return null;
    return {
      hash: parsed.h,
      timestamp: parsed.t,
      channelName: parsed.c ?? '',
      domain: parsed.d ?? '',
      messageCount: parsed.m ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Load or create a keypair for the Solana devnet.
 * In dev, persists keypair to .solana-keypair.json.
 * In production, load from SOLANA_PRIVATE_KEY env var.
 *
 * NOTE: This uses Node.js fs — only import from server API routes, never client components.
 */
function getKeypair(): Keypair {
  // Production: load from env
  if (process.env.SOLANA_PRIVATE_KEY) {
    const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
    return Keypair.fromSecretKey(secretKey);
  }

  // Dev: persist to a local file so airdrops survive restarts
  const keypairPath = path.join(process.cwd(), '.solana-keypair.json');
  if (fs.existsSync(keypairPath)) {
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
    return Keypair.fromSecretKey(secretKey);
  }

  // Generate new keypair and save
  const kp = Keypair.generate();
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(kp.secretKey)));
  console.log(`\n  [Solana] Generated keypair: ${kp.publicKey.toBase58()}`);
  console.log(`  [Solana] Saved to: ${keypairPath}`);
  console.log(`  [Solana] Fund with: solana airdrop 2 ${kp.publicKey.toBase58()} --url ${DEVNET_RPC}\n`);
  return kp;
}

/**
 * Record a hash receipt on Solana devnet using the Memo program.
 *
 * @param data - Receipt data to record on-chain
 * @returns Transaction signature (the receipt ID)
 */
export async function recordReceipt(data: SolanaReceiptData): Promise<string> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const keypair = getKeypair();

  const memoContent = buildMemoContent(data);
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoContent, 'utf-8'),
  });

  const blockhash = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({
    feePayer: keypair.publicKey,
    ...blockhash,
  });
  tx.add(memoInstruction);

  const signature = await connection.sendTransaction(tx, [keypair]);
  await connection.confirmTransaction(signature, 'confirmed');

  console.log(`[Solana] Recorded receipt: ${signature}`);
  return signature;
}

/**
 * Verify a receipt by fetching the transaction from devnet.
 *
 * @param txSignature - Transaction signature to look up
 * @returns Receipt data if found and valid, null otherwise
 */
export async function verifyReceipt(txSignature: string): Promise<SolanaReceiptData | null> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');

  try {
    const tx = await connection.getParsedTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) return null;

    // Look for Memo program instructions
    for (const ix of tx.transaction.message.instructions) {
      if (ix.programId.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
        if ('data' in ix && typeof ix.data === 'string') {
          const decoded = Buffer.from(ix.data, 'base64').toString('utf-8');
          const receipt = parseMemoContent(decoded);
          if (receipt) return receipt;
        }
      }
    }

    return null;
  } catch (err) {
    console.error('[Solana] Verify failed:', err);
    return null;
  }
}
