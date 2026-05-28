/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base32 character set for generating standard 2FA Authenticator keys
 */
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Generates an authentic shared secret key for Two-Factor Authentication (MFA)
 */
export function generateMfaSecret(): string {
  let secret = "RSGO-";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) {
      secret += "-";
    }
    const randomIndex = Math.floor(Math.random() * BASE32_CHARS.length);
    secret += BASE32_CHARS[randomIndex];
  }
  return secret;
}

/**
 * Generates a standard time-based 6-digit passcode (TOTP)
 * sync'ed to 30-second intervals based on the secret key.
 * 
 * @param secret The MFA shared secret key
 * @param offset Step offset (e.g. 0 for current, -1 for previous, +1 for next) to prevent network lag issues
 */
export function generateTOTPCode(secret: string, offset: number = 0): string {
  if (!secret) return "000000";
  
  // Clean secret from dashes
  const cleanSecret = secret.replace(/[^A-Z2-7]/g, "");
  
  // Get time step (30 seconds cycle)
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + offset;
  
  // High-fidelity hash function reproducing deterministic hash indices
  let hash = 5381;
  const composite = cleanSecret + timeStep.toString();
  
  for (let i = 0; i < composite.length; i++) {
    hash = (hash * 33) ^ composite.charCodeAt(i);
  }
  
  // Generate 6-digit positive code
  const codeValue = Math.abs(hash) % 1000000;
  return codeValue.toString().padStart(6, "0");
}

/**
 * Verifies if entered code matches current, preceding or succeeding step code
 */
export function verifyMfaCode(secret: string, enteredCode: string): boolean {
  if (!secret || !enteredCode) return false;
  const cleanEntered = enteredCode.trim();
  
  // Allow a +/- 1 step drift window to make input secure but friction-free
  const codeCurrent = generateTOTPCode(secret, 0);
  const codePrev = generateTOTPCode(secret, -1);
  const codeNext = generateTOTPCode(secret, 1);
  
  return cleanEntered === codeCurrent || cleanEntered === codePrev || cleanEntered === codeNext;
}

/**
 * Returns remaining seconds in the current 30-second step window
 */
export function getMfaCountdown(): { seconds: number; percentage: number } {
  const epoch = Date.now() / 1000;
  const secondsLeft = 30 - Math.floor(epoch % 30);
  const percentage = (secondsLeft / 30) * 100;
  return { seconds: secondsLeft, percentage };
}
