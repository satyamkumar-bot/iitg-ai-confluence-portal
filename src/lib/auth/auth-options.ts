import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { dataStore } from "../db/store";
import { UserRole } from "@/types";

const isAzureConfigured = Boolean(
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_TENANT_ID &&
  process.env.AZURE_AD_CLIENT_ID !== "00000000-0000-0000-0000-000000000000"
);

const isDevAuthMockEnabled = process.env.ENABLE_DEV_AUTH_MOCK === "true" || !isAzureConfigured;

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Real Microsoft Entra ID (Azure AD) OAuth / OIDC Provider
    ...(isAzureConfigured
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
            authorization: {
              params: {
                scope: "openid profile email User.Read",
              },
            },
          }),
        ]
      : []),

    // 2. Controlled Development & Testing Provider (clearly gated by ENABLE_DEV_AUTH_MOCK)
    // Allows seamless testing of Student vs Organizer roles without live Entra ID institutional tenant access
    ...(isDevAuthMockEnabled
      ? [
          CredentialsProvider({
            id: "dev-mock-login",
            name: "Development Mock Identity",
            credentials: {
              email: { label: "Email", type: "email" },
              role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;

              const normalizedEmail = credentials.email.trim().toLowerCase();
              let user = await dataStore.getUserByEmail(normalizedEmail);

              // If user doesn't exist, create development account
              if (!user) {
                const requestedRole = (credentials.role?.toUpperCase() === "ORGANIZER"
                  ? "ORGANIZER"
                  : "STUDENT") as UserRole;

                user = await dataStore.upsertUser({
                  email: normalizedEmail,
                  display_name: credentials.email.split("@")[0].replace(".", " ").toUpperCase(),
                  role: requestedRole,
                  department: "Data Science and Artificial Intelligence",
                });
              }

              return {
                id: user.id,
                email: user.email,
                name: user.display_name,
                role: user.role,
              };
            },
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const normalizedEmail = user.email.toLowerCase().trim();

      // Check if email is in organizer allowlist
      const adminEmails = (process.env.ORGANIZER_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const isExplicitAdmin = adminEmails.includes(normalizedEmail);
      const role: UserRole = isExplicitAdmin ? "ORGANIZER" : "STUDENT";

      // Upsert into persistent store with secure server-controlled role
      const dbUser = await dataStore.upsertUser({
        email: normalizedEmail,
        display_name: user.name || normalizedEmail.split("@")[0],
        role,
        microsoft_tenant_id: account?.providerAccountId ? (profile as any)?.tid : undefined,
        microsoft_object_id: account?.providerAccountId ? (profile as any)?.oid : undefined,
        avatar_url: user.image ?? undefined,
      });

      // Pass the db id and assigned role back to user object for jwt callback
      user.id = dbUser.id;
      (user as any).role = dbUser.role;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "STUDENT";
      }

      // Re-verify from database store to guarantee token role cannot be stale
      if (token.email) {
        const dbUser = await dataStore.getUserByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.department = dbUser.department;
          token.roll_number = dbUser.roll_number;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "STUDENT";
        (session.user as any).department = token.department;
        (session.user as any).roll_number = token.roll_number;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-at-least-32-chars-long",
};
