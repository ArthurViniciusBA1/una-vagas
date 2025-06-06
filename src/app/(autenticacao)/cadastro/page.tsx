import { CircleAlert, CornerUpLeft } from "lucide-react";
import Link from "next/link";
import RegistroForm from "./form";

export default function PaginaCadastro() {
    return (
        <main className="relative w-full flex flex-col items-center justify-center gap-8 py-8"> 
            <div className="w-full flex items-center justify-start mb-4">
                <Link href="/" className="">
                    <CornerUpLeft size={25} />
                </Link>
            </div>
            <div className="text-center w-full">
                <h1 className="text-3xl font-extrabold uppercase">Cadastro de Novo Usuário</h1>
                <span className="mt-2 flex items-center justify-center gap-2.5">
                    <CircleAlert size={30} className="text-red-600" />
                    <span className="text-red-500 text-sm font-bold cursor-default select-none">NÃO UTILIZE DADOS REAIS (AMBIENTE DE TESTES)</span>
                </span>
            </div>
            <div className="w-full max-w-md"> 
                <RegistroForm />
            </div>
        </main>
    );
}