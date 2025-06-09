import { RoleUsuario } from '@prisma/client'; 
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface TokenPayload extends JwtPayload {
  id: string;
  nome?: string;
  role?: RoleUsuario; 
}

interface AdminPrivadoLayoutProps {
  children: React.ReactNode;
}

export default async function AdminPrivadoLayout({ children }: AdminPrivadoLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("AdminPrivadoLayout: JWT_SECRET não definido.");
    redirect('/erro-configuracao');
  }

  let isAuthenticatedAsAdmin = false;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
      if (decodedToken?.role === RoleUsuario.ADMIN) {
        isAuthenticatedAsAdmin = true;
      } else {
        console.warn(`AdminPrivadoLayout: Tentativa de acesso por usuário com role '${decodedToken?.role}'. Redirecionando.`);
      }
    } catch (error) {
      console.warn("AdminPrivadoLayout: Token inválido ou expirado.", error);
    }
  }

  if (!isAuthenticatedAsAdmin) {
    const headersList = await headers();
    const currentPathname = headersList.get('x-next-pathname') || '/admin/dashboard';
    const errorMessage = encodeURIComponent("Acesso restrito. Faça login como administrador.");
    
    console.log(`AdminPrivadoLayout: Usuário não autenticado como ADMIN. Redirecionando para /admin/login. Path original: ${currentPathname}`);
    redirect(`/admin/login?error=${errorMessage}&redirect=${encodeURIComponent(currentPathname)}`);
  }

  return (
    // <AdminProvider data={adminDataParaContexto}>
      <div className="layout-admin-especifico">
        {/* <NavbarAdmin /> */}
        {/* <SidebarAdmin /> */}
        <main>{children}</main>
      </div>
    // </AdminProvider>
  );
}