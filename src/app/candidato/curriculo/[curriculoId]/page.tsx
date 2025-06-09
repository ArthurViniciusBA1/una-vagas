import {
    Award,
    Briefcase,
    FileText,
    Github,
    Languages,
    Lightbulb,
    Link as LinkIcon,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Star,
    User,
} from "lucide-react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";
import jwt, { JwtPayload } from 'jsonwebtoken';
import Link from "next/link";
import { Prisma, RoleUsuario } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

const curriculoQueryArgs = {
    include: {
        usuario: { select: { id: true, nome: true, email: true } },
        experienciasProfissionais: { orderBy: { dataInicio: 'desc' as const } },
        formacoesAcademicas: { orderBy: { dataInicio: 'desc' as const } },
        habilidades: { orderBy: { nome: 'asc' as const } },
        idiomas: { orderBy: { nome: 'asc' as const } },
        projetos: { orderBy: { nome: 'asc' as const } },
        certificacoes: { orderBy: { dataEmissao: 'desc' as const } },
    }
};

type CurriculoCompleto = Prisma.CurriculoGetPayload<typeof curriculoQueryArgs>;

interface TokenPayload extends JwtPayload {
    id: string;
    role?: RoleUsuario;
}

function formatarData(data: Date | null | undefined): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function CurriculoSecao({ titulo, icon, children }: { titulo: string, icon: ReactNode, children: ReactNode }) {
    return (
        <section className="mb-8">
            <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-primary">{titulo}</h2>
            </div>
            <div className="pl-[56px] border-l-2 border-primary/20 ml-4">
                {children}
            </div>
        </section>
    );
}

// A CORREÇÃO É NA ASSINATURA DA FUNÇÃO ABAIXO:
export default async function PaginaVisualizacaoCurriculo({ params: { curriculoId } }: { params: { curriculoId: string } }) {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!token || !jwtSecret) {
        redirect('/entrar');
    }

    const curriculo: CurriculoCompleto | null = await prisma.curriculo.findUnique({
        // Usamos a variável 'curriculoId' diretamente
        where: { id: curriculoId },
        ...curriculoQueryArgs 
    });

    if (!curriculo) {
        notFound();
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
        if (decodedToken.id !== curriculo.usuarioId && decodedToken.role !== RoleUsuario.ADMIN) {
             redirect('/acesso-negado'); 
        }
    } catch (error) {
        redirect('/entrar');
    }

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-10 my-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-800">{curriculo.usuario.nome}</h1>
                    <p className="text-xl text-primary font-medium mt-1">{curriculo.titulo}</p>
                </div>
                <div className="text-sm text-gray-600 flex flex-col items-start sm:items-end gap-1.5">
                    {curriculo.usuario.email && <span className="flex items-center gap-2"><Mail size={14} /> {curriculo.usuario.email}</span>}
                    {curriculo.telefone && <span className="flex items-center gap-2"><Phone size={14} /> {curriculo.telefone}</span>}
                    {curriculo.endereco && <span className="flex items-center gap-2"><MapPin size={14} /> {curriculo.endereco}</span>}
                    <div className="flex items-center gap-3 mt-2">
                        {curriculo.linkedinUrl && <Link href={curriculo.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="text-blue-700" /></Link>}
                        {curriculo.githubUrl && <Link href={curriculo.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="text-gray-800" /></Link>}
                    </div>
                </div>
            </header>

            {curriculo.resumoProfissional && (
                <CurriculoSecao titulo="Resumo Profissional" icon={<User size={20} className="text-primary"/>}>
                    <p className="text-gray-700 leading-relaxed">{curriculo.resumoProfissional}</p>
                </CurriculoSecao>
            )}

            <CurriculoSecao titulo="Experiência Profissional" icon={<Briefcase size={20} className="text-primary"/>}>
                <div className="space-y-6">
                    {curriculo.experienciasProfissionais.map(exp => (
                        <div key={exp.id}>
                            <h3 className="text-lg font-semibold text-gray-800">{exp.cargo}</h3>
                            <p className="text-md text-gray-700">{exp.nomeEmpresa} • {exp.local}</p>
                            <p className="text-sm text-gray-500 capitalize">{formatarData(exp.dataInicio)} - {exp.trabalhoAtual ? "Presente" : formatarData(exp.dataFim)}</p>
                            {exp.descricao && <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{exp.descricao}</p>}
                        </div>
                    ))}
                </div>
            </CurriculoSecao>
            
            <CurriculoSecao titulo="Formação Acadêmica" icon={<FileText size={20} className="text-primary"/>}>
                <div className="space-y-6">
                    {curriculo.formacoesAcademicas.map(formacao => (
                        <div key={formacao.id}>
                            <h3 className="text-lg font-semibold text-gray-800">{formacao.curso}</h3>
                            <p className="text-md text-gray-700">{formacao.instituicao}</p>
                            <p className="text-sm text-gray-500 capitalize">{formatarData(formacao.dataInicio)} - {formacao.emCurso ? "Presente" : formatarData(formacao.dataFim)}</p>
                        </div>
                    ))}
                </div>
            </CurriculoSecao>
            
            <CurriculoSecao titulo="Habilidades" icon={<Star size={20} className="text-primary"/>}>
                <div className="flex flex-wrap gap-2">
                    {curriculo.habilidades.map(hab => <Badge key={hab.id} variant="secondary">{hab.nome}</Badge>)}
                </div>
            </CurriculoSecao>

            <CurriculoSecao titulo="Idiomas" icon={<Languages size={20} className="text-primary"/>}>
                 <div className="space-y-2">
                    {curriculo.idiomas.map(idioma => (
                        <p key={idioma.id} className="text-gray-700">{idioma.nome} - <span className="font-semibold capitalize">{idioma.nivel.toLowerCase()}</span></p>
                    ))}
                </div>
            </CurriculoSecao>

             <CurriculoSecao titulo="Projetos" icon={<Lightbulb size={20} className="text-primary"/>}>
                <div className="space-y-6">
                    {curriculo.projetos.map(proj => (
                        <div key={proj.id}>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-800">{proj.nome}</h3>
                                {proj.projectUrl && <Link href={proj.projectUrl} target="_blank"><LinkIcon size={14} className="text-blue-600 hover:underline"/></Link>}
                                {proj.repositorioUrl && <Link href={proj.repositorioUrl} target="_blank"><Github size={14} className="text-gray-800 hover:underline"/></Link>}
                            </div>
                            {proj.descricao && <p className="mt-1 text-sm text-gray-600">{proj.descricao}</p>}
                        </div>
                    ))}
                </div>
            </CurriculoSecao>

            <CurriculoSecao titulo="Certificações" icon={<Award size={20} className="text-primary"/>}>
                 <div className="space-y-4">
                    {curriculo.certificacoes.map(cert => (
                        <div key={cert.id}>
                            <h3 className="text-md font-semibold text-gray-800">{cert.nome}</h3>
                            <p className="text-sm text-gray-700">{cert.organizacaoEmissora} - {formatarData(cert.dataEmissao)}</p>
                        </div>
                    ))}
                </div>
            </CurriculoSecao>
        </div>
    );
}