import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

let encryptionKeyBuffer: Buffer | undefined;

function getEncryptionKeyBuffer(): Buffer {
  if (!encryptionKeyBuffer) {
    const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;
    if (!ENCRYPTION_KEY_HEX) {
      // Mensagem de erro mais específica para o ambiente de execução
      throw new Error('ERRO DE SEGURANÇA: ENCRYPTION_KEY não está definida nas variáveis de ambiente. Verifique as configurações no .env.local (desenvolvimento) ou na Vercel (produção).');
    }

    const tempKeyBuffer = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
    if (tempKeyBuffer.length !== 32) {
      throw new Error(`ERRO DE SEGURANÇA: ENCRYPTION_KEY tem formato ou comprimento inválido (${tempKeyBuffer.length} bytes). Esperado 32 bytes (64 caracteres hexadecimais) para AES-256.`);
    }
    encryptionKeyBuffer = tempKeyBuffer;
  }
  return encryptionKeyBuffer;
}

export function encrypt(text: string): string {
  const iv = Buffer.alloc(IV_LENGTH, 0); // IV fixo
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKeyBuffer(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(text: string): string {
  const iv = Buffer.alloc(IV_LENGTH, 0); // IV fixo
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKeyBuffer(), iv);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}