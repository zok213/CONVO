export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SolanaReceiptData {
  hash: string;
  timestamp: number;
  channelName: string;
  messageCount: number;
  domain: string;
}

export function formatReceipt(data: SolanaReceiptData): string {
  return [
    `=== Solana Receipt ===`,
    `Hash: ${data.hash}`,
    `Timestamp: ${new Date(data.timestamp).toISOString()}`,
    `Channel: ${data.channelName}`,
    `Messages: ${data.messageCount}`,
    `Domain: ${data.domain}`,
    `=====================`,
  ].join('\n');
}

export function isValidHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}
