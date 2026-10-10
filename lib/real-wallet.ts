import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { hmac } from "@noble/hashes/hmac.js";
import { base58, base58check, bech32 } from "@scure/base";

/**
 * Custodial HD wallets (BIP39 + BIP44 / BIP84 / SLIP-0010).
 *
 * One master mnemonic lives only on the server. Each user gets a numeric
 * `index`. The same mnemonic + index always recreates the same on-chain
 * addresses — never send the mnemonic or private keys to the browser.
 *
 * Paths (account 0, change 0, address_index = user index):
 *   EVM  (ETH / BSC / Polygon / Arbitrum)  m/44'/60'/0'/0/{i}
 *   TRON (TRX / USDT-TRC20)                m/44'/195'/0'/0/{i}
 *   BTC  Native SegWit (bc1…)              m/84'/0'/0'/0/{i}   BIP84
 *   SOL                                    m/44'/501'/{i}'/0'
 */

/** Bitcoin/TRON Base58Check. `base58check(sha256)` already does SHA256d internally. */
const b58c = base58check(sha256);

export function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function requireKey(node: HDKey, path: string) {
  if (!node.privateKey || !node.publicKey) throw new Error(`HD derive failed: ${path}`);
  return node;
}

/** Uncompressed secp256k1 pubkey → EIP-55-style lowercase 0x address. Identical on every EVM chain. */
function ethAddress(priv: Uint8Array) {
  const pub = secp256k1.getPublicKey(priv, false).slice(1);
  return `0x${toHex(keccak_256(pub).slice(-20))}`;
}

/** P2WPKH Native SegWit (bc1q…). BIP84, not BIP44 P2PKH. */
function btcAddress(compressedPub: Uint8Array) {
  const h160 = ripemd160(sha256(compressedPub));
  return bech32.encode("bc", [0, ...bech32.toWords(h160)]);
}

/** TRON Base58Check, version byte 0x41 → addresses start with T. */
function tronAddress(priv: Uint8Array) {
  const pub = secp256k1.getPublicKey(priv, false).slice(1);
  const payload = new Uint8Array(21);
  payload[0] = 0x41;
  payload.set(keccak_256(pub).slice(-20), 1);
  return b58c.encode(payload);
}

/** SLIP-0010 ed25519 (Solana). All path levels are hardened. */
function slip10Ed25519(seed: Uint8Array, path: number[]) {
  let I = hmac(sha512, new TextEncoder().encode("ed25519 seed"), seed);
  let key = I.slice(0, 32);
  let chain = I.slice(32);
  for (const index of path) {
    const data = new Uint8Array(37);
    data[0] = 0;
    data.set(key, 1);
    new DataView(data.buffer).setUint32(33, (index | 0x80000000) >>> 0);
    I = hmac(sha512, chain, data);
    key = I.slice(0, 32);
    chain = I.slice(32);
  }
  return key;
}

function solAddress(seed: Uint8Array, index: number) {
  const priv = slip10Ed25519(seed, [44, 501, index, 0]);
  return base58.encode(ed25519.getPublicKey(priv));
}

export function isBip39(phrase: string) {
  return validateMnemonic(phrase.trim().toLowerCase(), wordlist);
}

/** 12-word English master seed. Call once, persist server-side. */
export function createMasterMnemonic() {
  return generateMnemonic(wordlist, 128);
}

export type CustodialAddresses = {
  index: number;
  eth: string;
  btc: string;
  tron: string;
  sol: string;
};

/**
 * Deterministic multi-chain addresses for `index`.
 * index 5 today === index 5 in a year. Private keys stay in this function's stack.
 */
export function deriveCustodialAddresses(masterMnemonic: string, index: number): CustodialAddresses {
  if (!Number.isInteger(index) || index < 0) throw new Error("HD index must be a non-negative integer");
  const phrase = masterMnemonic.trim().toLowerCase();
  if (!isBip39(phrase)) throw new Error("Invalid master mnemonic");
  const seed = mnemonicToSeedSync(phrase);
  const hd = HDKey.fromMasterSeed(seed);
  const i = index;
  const evmPath = `m/44'/60'/0'/0/${i}`;
  const btcPath = `m/84'/0'/0'/0/${i}`;
  const trxPath = `m/44'/195'/0'/0/${i}`;
  const evm = requireKey(hd.derive(evmPath), evmPath);
  const btc = requireKey(hd.derive(btcPath), btcPath);
  const trx = requireKey(hd.derive(trxPath), trxPath);
  return {
    index: i,
    eth: ethAddress(evm.privateKey!),
    btc: btcAddress(btc.publicKey!),
    tron: tronAddress(trx.privateKey!),
    sol: solAddress(seed, i),
  };
}

/** Server-only. Never return this object from an API. */
export function deriveCustodialSecrets(masterMnemonic: string, index: number) {
  const phrase = masterMnemonic.trim().toLowerCase();
  if (!isBip39(phrase)) throw new Error("Invalid master mnemonic");
  const seed = mnemonicToSeedSync(phrase);
  const hd = HDKey.fromMasterSeed(seed);
  const evm = requireKey(hd.derive(`m/44'/60'/0'/0/${index}`), "evm");
  const trx = requireKey(hd.derive(`m/44'/195'/0'/0/${index}`), "trx");
  return {
    index,
    evmPriv: evm.privateKey!,
    tronPriv: trx.privateKey!,
    addresses: deriveCustodialAddresses(phrase, index),
  };
}

export function tronToHex(address: string) {
  return toHex(b58c.decode(address));
}

export function hexToTron(hex: string) {
  const raw = hex.startsWith("41") ? hex : `41${hex.replace(/^0x/i, "").slice(-40)}`;
  const bytes = new Uint8Array(raw.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(raw.slice(i * 2, i * 2 + 2), 16);
  return b58c.encode(bytes);
}

const EVM_NETS = new Set(["ERC20", "BEP20", "ARB", "OP", "BASE", "MANTLE", "MATIC", "AVAX", "PLASMA"]);

export function addressForNetwork(w: CustodialAddresses, network: string) {
  if (EVM_NETS.has(network)) return w.eth;
  if (network === "TRC20") return w.tron;
  if (network === "BTC") return w.btc;
  if (network === "SOL") return w.sol;
  return null;
}

export function isValidTronAddress(address: string) {
  try {
    if (!address.startsWith("T") || address.length < 34 || address.length > 36) return false;
    const raw = b58c.decode(address);
    return raw.length === 21 && raw[0] === 0x41;
  } catch {
    return false;
  }
}

export function isOnChainAddress(network: string, address: string) {
  if (!address || address.startsWith("pending:")) return false;
  if (network === "TRC20") return isValidTronAddress(address);
  if (EVM_NETS.has(network)) return /^0x[0-9a-fA-F]{40}$/.test(address);
  if (network === "BTC") return address.startsWith("bc1") && address.length >= 20;
  if (network === "SOL") return address.length >= 32 && address.length <= 48;
  return address.length > 12;
}
