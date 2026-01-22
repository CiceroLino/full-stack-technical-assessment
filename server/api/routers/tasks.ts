import { createTaskSchema, taskIdSchema, updateTaskSchema } from "@/lib/validations";
import { task } from "@/server/db/schema"; // ← Remova o alias
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const [newTask] = await ctx.db
        .insert(task) // ← task
        .values({
          id: crypto.randomUUID(),
          title: input.title,
          description: input.description,
          status: input.status,
          userId: ctx.session.user.id,
        })
        .returning();

      return newTask;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.task.findMany({ // ← task não tasks
      where: eq(task.userId, ctx.session.user.id),
      orderBy: [desc(task.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(taskIdSchema)
    .query(async ({ ctx, input }) => {
      const foundTask = await ctx.db.query.task.findFirst({ // ← task
        where: and(
          eq(task.id, input.id),
          eq(task.userId, ctx.session.user.id)
        ),
      });

      if (!foundTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task não encontrada",
        });
      }

      return foundTask;
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const existingTask = await ctx.db.query.task.findFirst({ // ← task
        where: and(
          eq(task.id, input.id),
          eq(task.userId, ctx.session.user.id)
        ),
      });

      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task não encontrada",
        });
      }

      const [updatedTask] = await ctx.db
        .update(task) // ← task
        .set({
          title: input.title ?? existingTask.title,
          description: input.description !== undefined ? input.description : existingTask.description,
          status: input.status ?? existingTask.status,
          updatedAt: new Date(),
        })
        .where(eq(task.id, input.id))
        .returning();

      return updatedTask;
    }),

  delete: protectedProcedure
    .input(taskIdSchema)
    .mutation(async ({ ctx, input }) => {
      const existingTask = await ctx.db.query.task.findFirst({ // ← task
        where: and(
          eq(task.id, input.id),
          eq(task.userId, ctx.session.user.id)
        ),
      });

      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task não encontrada",
        });
      }

      await ctx.db.delete(task).where(eq(task.id, input.id)); // ← task

      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userTasks = await ctx.db.query.task.findMany({ // ← task
      where: eq(task.userId, ctx.session.user.id),
    });

    return {
      total: userTasks.length,
      completed: userTasks.filter((t) => t.status === "completed").length,
      pending: userTasks.filter((t) => t.status === "pending").length,
      inProgress: userTasks.filter((t) => t.status === "in_progress").length,
    };
  }),
});
