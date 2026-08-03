import "next-auth";
import "next-auth/jwt";

type Peran = "dosen" | "asesor" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      peran: Peran;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    peran?: Peran;
  }
}
