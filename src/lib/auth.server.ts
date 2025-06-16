import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoleUsuario } from '@prisma/client';

interface DecodedTokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

/**
 * Lê o token dos cookies, verifica sua validade e retorna o payload decodificado.
 * Esta é agora a ÚNICA função que interage com jwt.verify.
 * @returns O payload do token ou null se o token for inválido/inexistente.
 */
export async function getDecodedToken(): Promise<DecodedTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedTokenPayload;
    return decoded;
  } catch (error) {
    // Se a verificação falhar (token inválido, expirado, etc.), retorna null.
    console.warn('Falha na verificação do token JWT:', (error as Error).message);
    return null;
  }
}

/**
 * Verifica a autenticação e autorização do usuário para roles específicas.
 * Esta função agora usa getDecodedToken.
 * @param requiredRoles Um array de RoleUsuario que são permitidas para acessar o recurso.
 * @returns Um objeto com o userId, um booleano indicando autorização e a role do usuário.
 */
export async function authorizeUser(requiredRoles: RoleUsuario[]): Promise<{
  userId: string | null;
  isAuthorized: boolean;
  role: RoleUsuario | null;
}> {
  const decodedToken = await getDecodedToken();

  if (!decodedToken || !decodedToken.id || !decodedToken.role) {
    return { userId: null, isAuthorized: false, role: null };
  }

  const isAuthorized = requiredRoles.includes(decodedToken.role);

  return { userId: decodedToken.id, isAuthorized, role: decodedToken.role };
}
