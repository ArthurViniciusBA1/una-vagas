import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_segura';

const tokenDuration = 7 * (24 * 60 * 60); // 7 dias em segundos

export function gerarToken(payload: object, expiresIn = tokenDuration) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function validarToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}
