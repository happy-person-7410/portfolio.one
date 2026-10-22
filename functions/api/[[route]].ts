import { handleApiRequest, ApiEnv } from '../../src/server/apiHandler';

interface CloudflarePagesEnv extends ApiEnv {
  [key: string]: unknown;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

export const onRequest = async (context: EventContext<CloudflarePagesEnv, string, unknown>): Promise<Response> => {
  return handleApiRequest(context.request, context.env);
};
