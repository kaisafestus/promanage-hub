import server from '../dist/server/server.js';

export default async function fetch(request, env, ctx) {
  try {
    return await server.fetch(request, env, ctx);
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
