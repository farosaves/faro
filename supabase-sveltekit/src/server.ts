import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router,
      createContext,
    });
  },
};