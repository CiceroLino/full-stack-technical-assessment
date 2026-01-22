import { authRouter } from "./routers/auth";
import { tasksRouter } from "./routers/tasks";
import { createTRPCRouter, createCallerFactory } from "./trpc";


export const appRouter = createTRPCRouter({
  auth: authRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
