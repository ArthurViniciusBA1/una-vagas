import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoleUsuario } from '@prisma/client';
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Briefcase, Send } from 'lucide-react';
import { CandidatoProvider } from '@/context/CandidatoContext';

interface TokenPayload extends JwtPayload {
  id: string;
  nome?: string;
  role?: RoleUsuario;
  email?: string;
  numeroRA?: string | null;
}

interface CandidatoLayoutProps {
  children: React.ReactNode;
}

function CandidatoNavbar() {
  const navLinks = [
    { href: "/candidato/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/candidato/curriculo/editar-completo", label: "Meu Currículo", icon: FileText },
    { href: "/candidato/vagas", label: "Buscar Vagas", icon: Briefcase },
    { href: "/candidato/candidaturas", label: "Minhas Candidaturas", icon: Send },
  ];

  return (
    <nav className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center max-w-screen-xl">
        <div className="text-lg font-semibold text-primary">
          <Link href="/candidato/dashboard">Portal do Candidato</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            {navLinks.map(link => (
              <Button key={link.href} asChild variant="ghost" size="sm" className="px-2 md:px-3">
                <Link href={link.href} className="flex items-center">
                  <link.icon size={16} className="md:mr-2" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <LogoutButton variant="outline" size="sm" className='hover:bg-destructive'/>
        </div>
      </div>
    </nav>
  );
}


export default async function CandidatoLayout({ children }: CandidatoLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("CandidatoLayout: JWT_SECRET não definido. Redirecionando...");
    redirect('/');
  }

  let tokenData: TokenPayload | null = null;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
      if (decodedToken?.id && (decodedToken.role === RoleUsuario.CANDIDATO || decodedToken.role === RoleUsuario.ADMIN)) {
        tokenData = decodedToken;
      } else {
        console.warn(`CandidatoLayout: Tentativa de acesso por usuário com role '${decodedToken?.role}'.`);
      }
    } catch (error) {
      console.warn("CandidatoLayout: Token inválido ou expirado.", error);
    }
  }

  if (!tokenData) {
    const headersList = await headers();
    const originalPathname = headersList.get('x-next-pathname') || '/candidato/dashboard';
    const errorMessage = encodeURIComponent("Acesso restrito à área do candidato. Por favor, faça login.");
    redirect(`/entrar?error=${errorMessage}&redirect=${encodeURIComponent(originalPathname)}`);
  }

  return (
    <CandidatoProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <CandidatoNavbar />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 max-w-screen-xl">
          {children}
        </main>
      </div>
    </CandidatoProvider>
  );
}