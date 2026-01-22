import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "./db";
import { env } from "./config/env";
// import { v4 as uuidv4 } from "uuid";
import * as schema from "./db/schema";
// import { users, sessions, accounts, verifications } from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
    // schema: {
    //   user: users,      // Pass the actual table object
    //   session: sessions,
    //   account: accounts,        // ← ADICIONE ESTA
    //   verification: verifications,
    // },
    // schema: {
    //   user: {
    //     tableName: "t3_tasks_user",
    //     fields: {
    //       id: "id",
    //       email: "email",
    //       emailVerified: "emailVerified",
    //       // password: "password",  // Mapear passwordHash -> password
    //       passwordHash: "password",
    //       name: "name",
    //       createdAt: "createdAt",
    //       updatedAt: "updatedAt",
    //     },
    //   },
    //   session: {
    //     tableName: "t3_tasks_session",
    //     fields: {
    //       id: "id",
    //       userId: "user_id",
    //       token: "token",
    //       expiresAt: "expiresAt",
    //       createdAt: "createdAt",
    //     },
    //   },
    // },

  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutos
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.BETTER_AUTH_URL],
    // advanced: {
    //   database: {
    //     generateId: () => uuidv4(),
    //   },
    // },
  }
});