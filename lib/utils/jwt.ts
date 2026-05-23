import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_ISSUER = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Copy .env.local.example to .env.local and set JWT_SECRET.'
    );
  }
  return secret;
}

export const signJwt = async (payload: Record<string, unknown>, expiresIn: string = '1h'): Promise<string> => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (expiresIn === '1h' ? 60 * 60 : 60 * 60 * 24);
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(JWT_ISSUER)
    .sign(new TextEncoder().encode(getJwtSecret()));
  return jwt;
};

export const verifyJwt = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()), {
      issuer: JWT_ISSUER,
    });
    return payload;
  } catch (e) {
    console.error('JWT verification failed', e);
    return null;
  }
};
