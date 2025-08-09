import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const payload = {
    status: 'ok',
    service: 'YOLOVibe Website',
    time: new Date().toISOString(),
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};



