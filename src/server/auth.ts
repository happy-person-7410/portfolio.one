import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_SECRET = 'hp_studio_secure_jwt_secret_change_in_production_2026';

function getSecretKey(secret?: string): Uint8Array {
  return new TextEncoder().encode(secret || DEFAULT_SECRET);
}

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function signAdminToken(payload: AdminJwtPayload, secret?: string): Promise<string> {
  const key = getSecretKey(secret);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyAdminToken(token: string, secret?: string): Promise<AdminJwtPayload | null> {
  try {
    const key = getSecretKey(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: (payload.role as string) || 'admin',
    };
  } catch {
    return null;
  }
}

export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = request.headers.get('Cookie') || request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/hp_admin_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}
