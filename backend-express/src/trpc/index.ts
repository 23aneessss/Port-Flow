import { router } from './trpc.js';
import { agentRouter } from './agent.router.js';

export const appRouter = router({
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;

export { createContext } from './trpc.js';
