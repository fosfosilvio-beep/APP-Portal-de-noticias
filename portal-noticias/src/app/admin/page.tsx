import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // O dashboard vira a página de transmissão por enquanto, ou podemos criar um dashboard stub
  redirect("/admin/transmissao");
}
