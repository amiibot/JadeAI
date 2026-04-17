import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const DEFAULT_SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
} as const;

export function hashLocalPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64, DEFAULT_SCRYPT_PARAMS).toString('hex');

  return [
    'scrypt',
    DEFAULT_SCRYPT_PARAMS.N,
    DEFAULT_SCRYPT_PARAMS.r,
    DEFAULT_SCRYPT_PARAMS.p,
    salt,
    derivedKey,
  ].join('$');
}

export function verifyLocalPassword(password: string, passwordHash: string) {
  const [algorithm, n, r, p, salt, expectedKey] = passwordHash.split('$');

  if (
    algorithm !== 'scrypt'
    || !n
    || !r
    || !p
    || !salt
    || !expectedKey
  ) {
    return false;
  }

  try {
    const derivedKey = scryptSync(password, salt, expectedKey.length / 2, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });

    return timingSafeEqual(derivedKey, Buffer.from(expectedKey, 'hex'));
  } catch {
    return false;
  }
}
