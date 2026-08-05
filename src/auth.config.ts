import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Config Auth.js partagée par le runtime Edge (middleware) et Node (route handlers).
 * Ne PAS importer Prisma ici — Prisma ne tourne pas en Edge.
 */
export const authConfig = {
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      // Ce projet (site public Affinité) contient :
      //   - les pages marketing publiques
      //   - /admin/* (interne, ADMIN/MODERATOR uniquement)
      //   - /(auth)/* (connexion, inscription)
      //   - /poster-une-annonce (réservé ESCORT)
      // Les dashboards CLIENT et ESCORT sont externes (dashboard.affinité.com).
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnPost = nextUrl.pathname.startsWith("/poster-une-annonce");
      const isOnAuth =
        nextUrl.pathname.startsWith("/connexion") || nextUrl.pathname.startsWith("/inscription");

      if (isOnAdmin) {
        return isLoggedIn && (role === "ADMIN" || role === "MODERATOR");
      }
      if (isOnPost) {
        return isLoggedIn;
      }
      if (isOnAuth && isLoggedIn) {
        // ADMIN reste sur affinité.com/admin ; les autres rôles vont sur le dashboard externe.
        // Tous les redirects externes se font côté client après login (cf. login-form.tsx).
        // Ici on ne redirige que les ADMIN car ils sont internes.
        if (role === "ADMIN" || role === "MODERATOR") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        // Pour ESCORT/CLIENT, on laisse passer — le composant client fera le redirect externe.
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [], // déclarés dans auth.ts (runtime Node)
} satisfies NextAuthConfig;
