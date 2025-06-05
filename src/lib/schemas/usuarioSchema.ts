import { z } from "zod";

const apenasNumerosSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .pipe(z.string().min(1, "RA Invalido (utilize apenas números)"));

export const cadastroSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  numeroRA: apenasNumerosSchema.pipe(z.string().max(15, "RA inválido")),
  email: z.string().email("Insira um email válido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  path: ["confirmarSenha"],
  message: "As senhas não coincidem",
});

export type tCadastro = z.infer<typeof cadastroSchema>;

export type tUsuario = Omit<tCadastro, "confirmarSenha" | "senha"> & { 
  id: string;
  role: string;
  empresaId?: string;
};

// -----------------------------------------

export const loginCandidatoSchema = z.object({
  numeroRA: apenasNumerosSchema.pipe(z.string().max(15, "RA inválido")),
  senha: z.string().min(1),
});

export type tLoginCandidato = z.infer<typeof loginCandidatoSchema>;


// Empresa ---------------------------------

export const loginEmpresaSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export type tLoginEmpresa = z.infer<typeof loginEmpresaSchema>;

// Admin -----------------------------------

export const loginAdminSchema = z.object({
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(1, "Senha obrigatória."),
});

export type tLoginAdmin = z.infer<typeof loginAdminSchema>;
