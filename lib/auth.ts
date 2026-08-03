import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Konfigurasi NextAuth (FR-01, FR-02):
 * - Credentials provider: email + password (ditetapkan admin)
 * - JWT menyimpan peran (dosen/asesor/admin) untuk pembatasan akses per route
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email dan Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.pengguna.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.aktif || !user.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id_pengguna,
          name: user.nama,
          email: user.email,
          peran: user.peran,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.peran = (user as any).peran;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).peran = token.peran;
      }
      return session;
    },
  },
};
