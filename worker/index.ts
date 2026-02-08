interface Env {
  PRERENDER_TOKEN: string;
  ORIGIN_URL: string;
}

const BOT_AGENTS = [
  'googlebot',
  'yahoo! slurp',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot',
  'integration-test',
  'google-inspectiontool'
];

const IGNORE_EXTENSIONS = [
  '.js',
  '.css',
  '.xml',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.doc',
  '.txt',
  '.ico',
  '.rss',
  '.zip',
  '.mp3',
  '.rar',
  '.exe',
  '.wmv',
  '.avi',
  '.ppt',
  '.mpg',
  '.mpeg',
  '.tif',
  '.wav',
  '.mov',
  '.psd',
  '.ai',
  '.xls',
  '.mp4',
  '.m4a',
  '.swf',
  '.dat',
  '.dmg',
  '.iso',
  '.flv',
  '.m4v',
  '.torrent',
  '.woff',
  '.ttf',
  '.svg',
  '.webmanifest'
];

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
      const isPrerenderHeader = request.headers.get('X-Prerender');
      const isSkipHeader = request.headers.get('X-Prerender-Skip');
      const pathName = url.pathname.toLowerCase();
      const extension = pathName.substring(
        pathName.lastIndexOf('.') || pathName.length
      );

      const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot));
      const isIgnoredExtension =
        extension.length > 1 && IGNORE_EXTENSIONS.includes(extension);

      // Skip Prerender if:
      // 1. Not a bot
      // 2. Already coming from Prerender (loop protection)
      // 3. Is a static file extension (js, css, png, etc.)
      // 4. Has skip header (from our own origin fetch)
      if (!isBot || isPrerenderHeader || isIgnoredExtension || isSkipHeader) {
        // Let Cloudflare handle the default proxying to origin
        // By not returning anything specific, the request passes through
        return fetch(request);
      }

      // --- CACHE LOGIC ---
      const cache = (caches as any).default;
      const cacheUrl = new URL(request.url);
      cacheUrl.searchParams.append('__prerender_cache', 'true');
      const cacheKey = new Request(cacheUrl.toString(), request);

      let response = await cache.match(cacheKey);
      if (response) return response;

      // --- PRERENDER FETCH ---
      const prerenderUrl = `https://service.prerender.io/${request.url}`;
      const newHeaders = new Headers(request.headers);
      newHeaders.set('X-Prerender-Token', env.PRERENDER_TOKEN);

      response = await fetch(prerenderUrl, {
        headers: newHeaders,
        redirect: 'manual'
      });

      // Cache the result for 7 days
      const cachedResponse = new Response(response.body, response);
      cachedResponse.headers.set('Cache-Control', 'public, max-age=604800');
      cachedResponse.headers.set('X-Prerender-Used', 'true');
      cachedResponse.headers.set('X-User-Agent-Detected', userAgent);

      ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
      return cachedResponse;
    } catch (err: any) {
      return new Response(err.stack || err.message, { status: 500 });
    }
  }
};
