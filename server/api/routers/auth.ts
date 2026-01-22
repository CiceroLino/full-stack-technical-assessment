import { signUpSchema, signInSchema } from "@/lib/validations";
import { user as users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.user.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      const hashedPassword = await hash(input.password, 10);

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: input.email,
          name: input.name,
        })
        .returning();

      return {
        success: true,
        user: {
          id: newUser!.id,
          email: newUser!.email,
          name: newUser!.name,
        },
      };
    }),

  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.user.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const account = await ctx.db.query.account.findFirst({
        where: eq(users.id, user.id),
      });

      if (!account?.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const validPassword = await compare(input.password, account.password);

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),
});
