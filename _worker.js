/**
 * Cloudflare Workers / Pages Functions — 地球的另一边 API Proxy
 *
 * 通用格式，同时支持:
 *   wrangler pages deploy ./   (Pages 部署)
 *   wrangler deploy             (Workers + Assets 部署)
 *
 * 功能:
 *   - /api/* → 代理到外部 API (Nominatim / Wikipedia / Bing / Baidu)
 *   - /api/proxy?url=XXX → 通用代理
 *   - 其他路径 → 由 Cloudflare assets 系统托管静态文件
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // OPTIONS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // API Proxy routes
        if (path.startsWith('/api/')) {
            return handleAPI(path, url, request);
        }

        // Static files: Pages (env.ASSETS) or Workers ([assets] config)
        if (typeof env.ASSETS !== 'undefined') {
            return env.ASSETS.fetch(request);
        }

        return new Response('Not Found', { status: 404 });
    },
};

async function handleAPI(path, url, request) {
    const searchParams = url.searchParams;
    const queryString = url.search;

    if (path === '/api/proxy') {
        const target = searchParams.get('url');
        if (!target) return new Response('Missing url param', { status: 400, headers: corsHeaders });
        return proxyRequest(target, request);
    }

    if (path.startsWith('/api/nominatim/')) {
        const targetPath = path.replace('/api/nominatim', '');
        return proxyRequest('https://nominatim.openstreetmap.org' + targetPath + queryString, request);
    }

    if (path.startsWith('/api/wikipedia/')) {
        const targetPath = path.replace('/api/wikipedia', '');
        const domain = searchParams.get('domain') || 'en.wikipedia.org';
        return proxyRequest('https://' + domain + targetPath + queryString, request);
    }

    if (path.startsWith('/api/bing/')) {
        const targetPath = path.replace('/api/bing', '');
        const base = searchParams.get('base') || 'cn.bing.com';
        return proxyRequest('https://' + base + targetPath + queryString, request);
    }

    if (path.startsWith('/api/baike/')) {
        const targetPath = path.replace('/api/baike', '');
        return proxyRequest('https://baike.baidu.com' + targetPath + queryString, request);
    }

    return new Response('Unknown API route', { status: 404, headers: corsHeaders });
}

async function proxyRequest(target, request) {
    try {
        const headers = new Headers(request.headers);
        headers.delete('cf-connecting-ip');
        headers.delete('x-forwarded-for');
        headers.delete('x-real-ip');
        headers.set('User-Agent', 'AntipodeFinder/1.0 (Cloudflare Worker)');

        const response = await fetch(target, { method: request.method, headers });

        const respHeaders = new Headers(response.headers);
        for (const [key, value] of Object.entries(corsHeaders)) {
            respHeaders.set(key, value);
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: respHeaders,
        });
    } catch (err) {
        return new Response('Proxy error: ' + err.message, {
            status: 502,
            headers: corsHeaders,
        });
    }
}
