import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoleUsuario } from '@prisma/client';

interface TokenPayload extends JwtPayload {
  id: string;
  nome?: string;
  role?: RoleUsuario;
  email?: string;
  empresaId?: string | null;
}

interface EmpresaLayoutProps {
  children: React.ReactNode;
}

export default async function EmpresaLayout({ children }: EmpresaLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("EmpresaLayout: JWT_SECRET não definido.");
    redirect('/login-empresa?error=' + encodeURIComponent("Erro de configuração do servidor."));
  }

  let isAuthenticatedAsEmpresaUser = false;
  let empresaUserData: TokenPayload | null = null;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
      
      if (decodedToken?.id && (decodedToken.role === RoleUsuario.RECRUTADOR || decodedToken.role === RoleUsuario.ADMIN)) {
        if (decodedToken.role === RoleUsuario.RECRUTADOR && !decodedToken.empresaId) {
          console.warn(`EmpresaLayout: Recrutador ${decodedToken.id} sem empresaId no token. Acesso negado.`);
        } else {
          isAuthenticatedAsEmpresaUser = true;
          empresaUserData = decodedToken;
        }
      } else {
        console.warn(`EmpresaLayout: Tentativa de acesso por usuário com role '${decodedToken?.role}'.`);
      }
    } catch (error) {
      console.warn("EmpresaLayout: Token inválido ou expirado.", error);
    }
  }

  if (!isAuthenticatedAsEmpresaUser) {
    const headersList = await headers();
    const originalPathname = headersList.get('x-next-pathname') || headersList.get('x-middleware-original-path') || '/empresa/dashboard';
    const errorMessage = encodeURIComponent("Acesso restrito. Faça login como empresa/recrutador.");
    
    console.log(`EmpresaLayout: Usuário não autenticado como RECRUTADOR/ADMIN para acessar ${originalPathname}. Redirecionando para /login-empresa.`);
    redirect(`/login-empresa?error=${errorMessage}&redirect=${encodeURIComponent(originalPathname)}`);
  }

  return (
      <div className="layout-empresa-especifico w-full min-h-screen flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
      </div>
  );
}