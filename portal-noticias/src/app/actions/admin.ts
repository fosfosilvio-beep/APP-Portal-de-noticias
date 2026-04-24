"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createColumnistUserAction(formData: {
  nome: string;
  email: string;
  password: string;
  cargo_descricao: string;
  foto_perfil: string;
  biografia: string;
  slug: string;
}) {
  const supabase = getSupabaseAdmin();

  try {
    // 1. Criar o usuário no Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { nome_completo: formData.nome }
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Atribuir a role de 'autor'
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: "autor" }]);

    if (roleError) throw roleError;

    // 3. Criar o perfil na tabela de colunistas
    // Usamos o ID do usuário criado para vincular, se necessário, 
    // mas a tabela colunistas parece usar UUID próprio. 
    // Vamos manter a estrutura atual mas garantir que os dados batem.
    const { error: profileError } = await supabase
      .from("colunistas")
      .insert([{
        nome: formData.nome,
        cargo_descricao: formData.cargo_descricao,
        foto_perfil: formData.foto_perfil,
        biografia: formData.biografia,
        slug: formData.slug
      }]);

    if (profileError) throw profileError;

    // 4. Criar entrada na tabela profiles (para auditoria)
    await supabase.from("profiles").insert([{
      id: userId,
      nome_completo: formData.nome,
      email: formData.email
    }]);

    revalidatePath("/admin/colunistas");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar colunista:", error);
    return { success: false, error: error.message };
  }
}
