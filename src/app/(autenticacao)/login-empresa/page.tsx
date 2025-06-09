import { Briefcase, CornerUpLeft } from "lucide-react";
import Link from "next/link";

import FormLoginEmpresa from "./form"; 

export default function PaginaLoginEmpresa() {
  return (
    <>
      <main className="relative w-full flex flex-col items-center justify-center gap-8 py-8 px-4">
        <Link href="/" className="absolute left-2 top-4 md:left-4 md:top-6">
          <CornerUpLeft size={25} />
        </Link>
        <div className="text-center">
          <Briefcase size={40} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-extrabold uppercase">Acesso Empresa / Recrutador</h1>
          <p className="text-muted-foreground mt-2">Faça login para gerenciar suas vagas e candidatos.</p>
        </div>
        <div className="w-full max-w-md">
          <FormLoginEmpresa />
        </div>
      </main>
    </>
  );
}