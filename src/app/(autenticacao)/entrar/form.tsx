// src/app/(autenticacao)/entrar/form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"; //
import { Button } from "@/components/ui/button"; //
import { FloatingLabelInput } from "@/components/custom/FloatingLabelInput"; // Usando seu componente customizado
import { loginCandidatoSchema, tLoginCandidato } from "@/lib/schemas/usuarioSchema"; //

export default function FormLoginCandidato() {
  const router = useRouter();

  const form = useForm<tLoginCandidato>({
    resolver: zodResolver(loginCandidatoSchema),
    defaultValues: {
      numeroRA: "",
      senha: "",
    },
  });

  const onSubmit = async (data: tLoginCandidato) => {
    try {
      const payload = { 
        ...data, 
        tipoAcesso: "candidato" // Informa à API que é um login de candidato
      };

      const res = await fetch("/api/auth/login", { // API Unificada
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();    

      if (!res.ok) {
        // A API de login unificada retorna error.form para erros genéricos de credenciais
        toast.error(result.error?.form || result.error || "RA ou senha inválidos.");
        return;
      }

      toast.success("Login realizado com sucesso!");
      // Após o login bem-sucedido, o middleware ou o layout da área privada do candidato
      // deve lidar com o redirecionamento para o dashboard correto.
      // Mas um push aqui garante o redirecionamento imediato.
      router.push('/dashboard'); // Ou a rota principal do dashboard do candidato que é /candidato/dashboard

    } catch (error) {
      console.error("Erro no login do candidato:", error);
      toast.error("Erro ao tentar fazer login. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
        <FormField
          control={form.control}
          name="numeroRA"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label="Número de RA"
                  id="numeroRA"
                  inputMode="numeric"
                  autoComplete="username" // RA pode ser considerado um username
                  {...field}
                  // Se você tiver a limpeza de RA no Zod schema com .transform(), 
                  // o onChange manual aqui pode ser redundante, mas não prejudica.
                  onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label="Senha"
                  id="senhaCandidato" // ID único para o input
                  type="password"
                  showPasswordToggle={true} // Habilita o olho para mostrar/ocultar senha
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Opcional: Link para "Esqueci minha senha" específico para candidatos */}
        {/* <div className="text-sm text-right">
          <Link href="/recuperar-senha-candidato" className="font-medium text-primary hover:underline">
            Esqueceu sua senha?
          </Link>
        </div> */}

        <Button type="submit" disabled={form.formState.isSubmitting} variant="default" className="w-full cursor-pointer mt-4">
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}