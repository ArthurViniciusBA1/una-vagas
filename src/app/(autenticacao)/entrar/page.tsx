import { CornerUpLeft, UserSquare } from "lucide-react";
import Link from "next/link";
import FormLoginCandidato from "./form"; 

export default function PaginaEntrarCandidato() {
  return (
    <>
      <main className="relative w-full flex flex-col items-center justify-center gap-8 py-8 px-4">
        <Link href="/" className="absolute left-2 top-4 md:left-4 md:top-6" aria-label="Voltar para a página inicial">
          <CornerUpLeft size={25} />
        </Link>
        <div className="text-center">
          <UserSquare size={40} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-extrabold uppercase">Entrar como Candidato</h1>
          <p className="text-muted-foreground mt-2">Use seu RA e senha para acessar.</p>
        </div>
        <div className="w-full max-w-md">
          <FormLoginCandidato />
        </div>
      </main>
    </>
  );
}