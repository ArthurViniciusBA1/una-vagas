// prisma/seed.ts
import { PrismaClient, RoleUsuario, TipoVaga } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding de novas empresas e vagas (sem limpar o banco)...');

  // --- 0. Verifica e cria usuário ADMIN se não existir ---
  let adminUser = await prisma.usuario.findUnique({
    where: { email: 'admin@vagasuna.com' },
  });

  if (!adminUser) {
    const senhaHash = await bcrypt.hash('Senha123', 10);
    adminUser = await prisma.usuario.create({
      data: {
        nome: 'Admin Master',
        email: 'admin@vagasuna.com',
        senha: senhaHash,
        role: RoleUsuario.ADMIN,
      },
    });
    console.log('Usuário Admin de teste criado.');
  } else {
    console.log('Usuário Admin de teste já existe.');
  }

  // --- 0. Verifica e cria usuário CANDIDATO de teste se não existir ---
  let candidatoTeste = await prisma.usuario.findUnique({
    where: { numeroRA: '123456789' },
  });

  if (!candidatoTeste) {
    const senhaHash = await bcrypt.hash('Senha123', 10);
    candidatoTeste = await prisma.usuario.create({
      data: {
        nome: 'Candidato Teste',
        email: 'candidato@test.com',
        numeroRA: '123456789',
        senha: senhaHash,
        role: RoleUsuario.CANDIDATO,
      },
    });
    // Cria um currículo para o candidato teste se ele acabou de ser criado
    await prisma.curriculo.upsert({
      where: { usuarioId: candidatoTeste.id },
      update: {}, // Não atualiza se já existir
      create: {
        usuarioId: candidatoTeste.id,
        titulo: 'Currículo de Teste do Candidato',
        resumoProfissional: 'Desenvolvedor Full Stack com 5 anos de experiência.',
        telefone: '31987654321',
        endereco: 'Belo Horizonte - MG',
        linkedinUrl: 'https://www.linkedin.com/in/candidato-teste',
        githubUrl: 'https://github.com/candidato-teste',
      },
    });
    console.log('Usuário Candidato de teste e currículo criados.');
  } else {
    console.log('Usuário Candidato de teste já existe.');
  }

  // --- 1. Criação de Empresas (apenas se não existirem) ---
  const [empresa1, empresa2, empresa3] = await Promise.all([
    prisma.empresa.upsert({
      where: { nome: 'Tech Solutions Inc.' },
      update: {},
      create: {
        nome: 'Tech Solutions Inc.',
        cnpj: '12.345.678/0001-90',
        descricao: 'Líder em soluções de tecnologia e software.',
        websiteUrl: 'https://www.techsolutions.com',
        logoUrl: '/logos/techsolutions.png',
      },
    }),
    prisma.empresa.upsert({
      where: { nome: 'Creative Design Studio' },
      update: {},
      create: {
        nome: 'Creative Design Studio',
        cnpj: '98.765.432/0001-12',
        descricao: 'Agência especializada em design gráfico e web.',
        websiteUrl: 'https://www.creativedesign.com',
        logoUrl: '/logos/creativedesign.png',
      },
    }),
    prisma.empresa.upsert({
      where: { nome: 'Global Corp Finance' },
      update: {},
      create: {
        nome: 'Global Corp Finance',
        cnpj: '11.223.3344/0001-55',
        descricao: 'Consultoria financeira internacional.',
        websiteUrl: 'https://www.globalcorp.com',
        logoUrl: '/logos/globalcorp.png',
      },
    }),
  ]);

  console.log('Empresas verificadas/criadas.');

  // --- 2. Criação de Usuários Recrutadores (apenas se não existirem) ---
  const senhaHash = await bcrypt.hash('Senha123', 10);

  const [recrutador1, recrutador2] = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'ana@techsolutions.com' },
      update: {},
      create: {
        nome: 'Ana Recrutadora',
        email: 'ana@techsolutions.com',
        senha: senhaHash,
        role: RoleUsuario.RECRUTADOR,
        empresaId: empresa1.id,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'bruno@creativedesign.com' },
      update: {},
      create: {
        nome: 'Bruno Designer',
        email: 'bruno@creativedesign.com',
        senha: senhaHash,
        role: RoleUsuario.RECRUTADOR,
        empresaId: empresa2.id,
      },
    }),
  ]);

  console.log('Usuários recrutadores verificados/criados.');

  // --- 3. Criação de Vagas (verifica existência pelo título e empresaId, mas não usa upsert direto) ---
  const allVagasToSeed = [
    {
      titulo: 'Desenvolvedor Front-end Pleno',
      descricao: 'Desenvolvimento de interfaces de usuário com React e Next.js.',
      requisitos: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      tipo: TipoVaga.EFETIVO_JR,
      localizacao: 'Remoto',
      faixaSalarial: 'R$ 4.000 - R$ 6.000',
      ativa: true,
      empresaId: empresa1.id,
      criadoPorId: recrutador1.id,
      dataPublicacao: new Date(), // <-- ADICIONADO AQUI
      dataExpiracao: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    {
      titulo: 'Estágio em Análise de Dados',
      descricao: 'Suporte à equipe de dados na coleta e análise de informações.',
      requisitos: ['Excel', 'SQL Básico', 'Python (desejável)'],
      tipo: TipoVaga.ESTAGIO,
      localizacao: 'Belo Horizonte - MG',
      faixaSalarial: 'R$ 1.200 - R$ 1.800',
      ativa: true,
      empresaId: empresa1.id,
      criadoPorId: recrutador1.id,
      dataPublicacao: new Date(), // <-- ADICIONADO AQUI
      dataExpiracao: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    },
    {
      titulo: 'Designer UX/UI Sênior',
      descricao: 'Criação de experiências de usuário inovadoras.',
      requisitos: ['Figma', 'Adobe XD', 'Pesquisa de Usuário', 'Prototipagem'],
      tipo: TipoVaga.EFETIVO_JR,
      localizacao: 'São Paulo - SP',
      faixaSalarial: 'R$ 7.000 - R$ 10.000',
      ativa: true,
      empresaId: empresa2.id,
      criadoPorId: recrutador2.id,
      dataPublicacao: new Date(), // <-- ADICIONADO AQUI
      // dataExpiracao: undefined (pode ser null no banco)
    },
    {
      titulo: 'Motion Designer (Projeto Curto)',
      descricao: 'Criação de animações para campanha de marketing.',
      requisitos: ['After Effects', 'Illustrator', 'Cinema 4D (desejável)'],
      tipo: TipoVaga.PROJETO,
      localizacao: 'Remoto',
      faixaSalarial: 'R$ 3.000 - R$ 5.000 (por projeto)',
      ativa: true,
      empresaId: empresa2.id,
      criadoPorId: recrutador2.id,
      dataPublicacao: new Date(), // <-- ADICIONADO AQUI
      dataExpiracao: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  ];

  const createdVagas = [];
  for (const vagaData of allVagasToSeed) {
    const existingVaga = await prisma.vaga.findFirst({
      where: {
        titulo: vagaData.titulo,
        empresaId: vagaData.empresaId,
      },
    });

    if (!existingVaga) {
      const newVaga = await prisma.vaga.create({
        data: {
          ...vagaData,
          // dataPublicacao: vagaData.dataPublicacao || new Date(), // Não é mais necessário o fallback aqui, pois já está no objeto
        },
      });
      createdVagas.push(newVaga);
      console.log(`Vaga "${newVaga.titulo}" para "${newVaga.empresaId}" criada.`);
    } else {
      createdVagas.push(existingVaga); // Adiciona a vaga existente para uso posterior
      console.log(`Vaga "${existingVaga.titulo}" para "${existingVaga.empresaId}" já existe.`);
    }
  }

  // Mapeia para um array acessível por índice se precisar, ex: vagas[0]
  // Ou você pode usar um objeto para acessar por título se for mais conveniente.
  const vagaMap = new Map<string, (typeof createdVagas)[0]>();
  createdVagas.forEach((v) => vagaMap.set(`${v.titulo}-${v.empresaId}`, v));

  // --- 4. Criação de Candidaturas (apenas se não existirem) ---
  // Para candidaturas, podemos usar a combinação de usuarioId e vagaId como chave única.
  await Promise.all([
    prisma.candidatura.upsert({
      where: {
        usuarioId_vagaId: {
          usuarioId: candidatoTeste.id,
          vagaId: vagaMap.get('Desenvolvedor Front-end Pleno-' + empresa1.id)!.id,
        },
      },
      update: {},
      create: {
        usuarioId: candidatoTeste.id,
        vagaId: vagaMap.get('Desenvolvedor Front-end Pleno-' + empresa1.id)!.id,
        status: 'INSCRITO',
        cartaApresentacao: 'Tenho grande interesse na vaga de Front-end.',
        dataCandidatura: new Date(),
      },
    }),
    prisma.candidatura.upsert({
      where: {
        usuarioId_vagaId: {
          usuarioId: candidatoTeste.id,
          vagaId: vagaMap.get('Designer UX/UI Sênior-' + empresa2.id)!.id,
        },
      },
      update: {},
      create: {
        usuarioId: candidatoTeste.id,
        vagaId: vagaMap.get('Designer UX/UI Sênior-' + empresa2.id)!.id,
        status: 'VISUALIZADA',
        cartaApresentacao: 'Experiência sólida em UX/UI.',
        dataCandidatura: new Date(),
      },
    }),
  ]);

  console.log('Candidaturas de teste verificadas/criadas.');

  console.log('Seeding concluído com sucesso (dados adicionados/verificados)!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
