import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { gerarToken } from "@/helpers/jwt";
import { cookies } from "next/headers";
import { 
  loginCandidatoSchema, 
  loginEmpresaSchema, 
  loginAdminSchema, 
  tLoginCandidato, 
  tLoginEmpresa, 
  tLoginAdmin 
} from "@/lib/schemas/usuarioSchema";
import { prisma } from "@/lib/prisma";
import { Usuario, RoleUsuario } from "@prisma/client";

interface TokenPayload {
  id: string;
  nome: string;
  role: RoleUsuario;
  email?: string;
  numeroRA?: string | null;
  empresaId?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipoAcesso, ...credentials } = body;

    let usuarioAutenticado: Usuario | null = null;
    let tokenPayload: TokenPayload;

    if (!tipoAcesso) {
      return NextResponse.json({ error: { form: "Tipo de acesso não especificado." } }, { status: 400 });
    }

    if (tipoAcesso === "candidato") {
      const result = loginCandidatoSchema.safeParse(credentials);
      if (!result.success) {
        return NextResponse.json({ error: { form: "Dados de login inválidos.", details: result.error.format() } }, { status: 400 });
      }
      const { numeroRA, senha } = result.data as tLoginCandidato;
      const usuario = await prisma.usuario.findUnique({ where: { numeroRA } });

      if (!usuario || usuario.role !== RoleUsuario.CANDIDATO) {
        return NextResponse.json({ error: { form: "RA ou senha inválidos, ou perfil não autorizado." } }, { status: 401 });
      }
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return NextResponse.json({ error: { form: "RA ou senha inválidos." } }, { status: 401 });
      }
      usuarioAutenticado = usuario;
      tokenPayload = {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role,
        numeroRA: usuario.numeroRA,
        email: usuario.email,
      };

    } else if (tipoAcesso === "empresa" || tipoAcesso === "admin") {
      const schemaToUse = tipoAcesso === "admin" ? loginAdminSchema : loginEmpresaSchema;
      const result = schemaToUse.safeParse(credentials);
      if (!result.success) {
        return NextResponse.json({ error: { form: "Dados de login inválidos.", details: result.error.format() } }, { status: 400 });
      }
      const { email, senha } = result.data as (tLoginEmpresa | tLoginAdmin);
      const usuario = await prisma.usuario.findUnique({ where: { email } });

      const expectedRole = tipoAcesso === "admin" ? RoleUsuario.ADMIN : RoleUsuario.RECRUTADOR;

      if (!usuario || usuario.role !== expectedRole) {
        return NextResponse.json({ error: { form: "E-mail ou senha inválidos, ou perfil não autorizado para este tipo de acesso." } }, { status: 401 });
      }
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return NextResponse.json({ error: { form: "E-mail ou senha inválidos." } }, { status: 401 });
      }
      usuarioAutenticado = usuario;
      tokenPayload = {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role,
        email: usuario.email,
        empresaId: usuario.empresaId,
      };
    } else {
      return NextResponse.json({ error: { form: "Tipo de acesso inválido." } }, { status: 400 });
    }

    if (!usuarioAutenticado) {
      return NextResponse.json({ error: { form: "Falha na autenticação." } }, { status: 401 });
    }

    const token = gerarToken(tokenPayload);

    const cookieStore = await cookies();
    if (cookieStore.has("token")) {
      cookieStore.delete("token");
    }
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      usuario: tokenPayload,
    });

  } catch (error) {
    console.error("Erro no endpoint de login:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao processar o login." }, { status: 500 });
  }
}
