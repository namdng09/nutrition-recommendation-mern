// Define the shape of our environment variables
interface Env {
  PRERENDER_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    const bots = [
      'googlebot',
      'bingbot',
      'facebookexternalhit',
      'twitterbot',
      'whatsapp',
      'linkedinbot',
      'slackbot'
    ];
    // Simple bot check
    const isBot = bots.some(bot => userAgent.includes(bot));

    // 1. If it's a Bot and not a static file, we use Prerender
    if (isBot && !url.pathname.includes('.')) {
      // Access Cloudflare-specific cache
      const cache = (caches as any).default;

      // create a unique cache key for the prerendered content
      // so it doesn't conflict with normal user requests
      const cacheUrl = new URL(request.url);
      cacheUrl.searchParams.append('__prerender_cache', 'true');
      const cacheKey = new Request(cacheUrl.toString(), request);

      // Check Cache
      let response = await cache.match(cacheKey);
      if (response) return response;

      // Miss? Fetch from Prerender.io
      const prerenderUrl = `https://service.prerender.io/${request.url}`;
      response = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': env.PRERENDER_TOKEN
        }
      });

      // Cache the result for 7 days
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=604800');

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // 2. For humans: Just fetch the origin (Cloudflare will handle standard caching)
    return fetch(request);
  }
};
