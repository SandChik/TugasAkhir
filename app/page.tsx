import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const peran = session.user.peran;
  redirect(peran === "admin" ? "/admin" : peran === "asesor" ? "/asesor" : "/dosen");
}
