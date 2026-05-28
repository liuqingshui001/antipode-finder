/**
 * Cloudflare Workers — 地球的另一边 API Proxy + Static Server
 * 
 * 部署方式:
 *   wrangler deploy
 * 
 * Pages Functions 模式 (放在 /functions/api/[[proxy]].js):
 *   自动路由 /api/* 到本函数
 * 
 * 功能:
 *   1. 根路径 → 返回 index.html
 *   2. /api/* → 代理到外部 API (Nominatim / Wikipedia / Bing / Baidu)
 *      - /api/nominatim/*  
 *      - /api/wikipedia/*
 *      - /api/bing/*
 *      - /api/baike/*
 *   3. /api/proxy?url=XXX → 通用代理 (替代 corsproxy.io)
 */

// HTML 文件内容 (wrangler 部署时自动包含)
// eslint-disable-next-line no-undef
const HTML = __STATIC_CONTENT_MANIFEST
    ? undefined  // Workers with static assets
    : null;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // ====== CORS headers for all responses ======
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        };

        // Handle OPTIONS (preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // ====== API Proxy routes ======
        if (path.startsWith('/api/')) {
            return handleAPI(path, url, request, corsHeaders);
        }

        // ====== Static files ======
        // For Pages Functions: serve static files from the root
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        // For Workers: serve index.html
        const html = await getHTML(env);
        if (html) {
            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    ...corsHeaders,
                },
            });
        }

        return new Response('Not Found', { status: 404 });
    },
};

/**
 * Route API requests to external services
 */
async function handleAPI(path, url, request, corsHeaders) {
    const searchParams = url.searchParams;
    const queryString = url.search; // includes the ?

    // /api/proxy?url=XXX  — generic proxy (replaces corsproxy.io)
    if (path === '/api/proxy') {
        const target = searchParams.get('url');
        if (!target) return new Response('Missing url param', { status: 400, headers: corsHeaders });
        return proxyRequest(target, request, corsHeaders);
    }

    // /api/nominatim/search?...  — Nominatim OpenStreetMap
    if (path.startsWith('/api/nominatim/')) {
        const targetPath = path.replace('/api/nominatim', '');
        const target = `https://nominatim.openstreetmap.org${targetPath}${queryString}`;
        return proxyRequest(target, request, corsHeaders);
    }

    // /api/wikipedia/*  — Wikipedia API
    if (path.startsWith('/api/wikipedia/')) {
        const targetPath = path.replace('/api/wikipedia', '');
        const domain = searchParams.get('domain') || 'en.wikipedia.org';
        const target = `https://${domain}${targetPath}${queryString}`;
        return proxyRequest(target, request, corsHeaders);
    }

    // /api/bing/*  — Bing search/news/images
    if (path.startsWith('/api/bing/')) {
        const targetPath = path.replace('/api/bing', '');
        const base = searchParams.get('base') || 'cn.bing.com';
        const target = `https://${base}${targetPath}${queryString}`;
        return proxyRequest(target, request, corsHeaders);
    }

    // /api/baike/*  — Baidu Baike
    if (path.startsWith('/api/baike/')) {
        const targetPath = path.replace('/api/baike', '');
        const target = `https://baike.baidu.com${targetPath}${queryString}`;
        return proxyRequest(target, request, corsHeaders);
    }

    return new Response('Unknown API route', { status: 404, headers: corsHeaders });
}

/**
 * Proxy a request to the target URL
 */
async function proxyRequest(target, request, corsHeaders) {
    try {
        const headers = new Headers(request.headers);
        // Remove hop-by-hop headers
        headers.delete('cf-connecting-ip');
        headers.delete('x-forwarded-for');
        headers.delete('x-real-ip');
        headers.set('User-Agent', 'AntipodeFinder/1.0 (Cloudflare Worker)');

        const response = await fetch(target, {
            method: request.method,
            headers: headers,
        });

        const respHeaders = new Headers(response.headers);
        // Add CORS headers
        for (const [key, value] of Object.entries(corsHeaders)) {
            respHeaders.set(key, value);
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: respHeaders,
        });
    } catch (err) {
        return new Response(`Proxy error: ${err.message}`, {
            status: 502,
            headers: corsHeaders,
        });
    }
}

/**
 * Get the HTML content (for Workers without static assets)
 */
async function getHTML(env) {
    // For Workers with static assets (wrangler.toml with site.bucket)
    try {
        // eslint-disable-next-line no-undef
        if (typeof __STATIC_CONTENT !== 'undefined') {
            // eslint-disable-next-line no-undef
            const content = await __STATIC_CONTENT.get('index.html', 'text');
            if (content) return content;
        }
    } catch { /* ignore */ }

    // For Pages Functions, assets are handled by env.ASSETS
    return null;
}
