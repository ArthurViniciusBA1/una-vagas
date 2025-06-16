import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('Variável de ambiente JWT_SECRET não definida!');
    throw new Error('Configuração de segurança do servidor incompleta.');
  }
  return secret;
}

const tokenDuration = 7 * 60 * 60 * 24; // 7 dias em segundos

export function gerarToken(payload: object, expiresIn = tokenDuration) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function validarToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}
