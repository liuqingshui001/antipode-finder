# build-final.py
import sys

# Read the HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Escape the HTML for embedding in a JS backtick template literal
# Order matters: backslash first, then backtick, then template expr
escaped = html.replace('\\', '\\\\')
escaped = escaped.replace('`', '\\`')
escaped = escaped.replace('${', '\\${')

# Worker API proxy code (no template needed, will be appended after the HTML string)
worker_code = r"""
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
        if (path.startsWith('/api/')) {
            return handleAPI(path, url, request);
        }
        return new Response(INDEX_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        });
    },
};

async function handleAPI(path, url, request) {
    const params = url.searchParams;
    const qs = url.search;
    if (path === '/api/proxy') {
        const t = params.get('url');
        if (!t) return new Response('Missing url', { status: 400, headers: corsHeaders });
        return doProxy(t, request);
    }
    if (path.startsWith('/api/nominatim/')) {
        return doProxy('https://nominatim.openstreetmap.org' + path.replace('/api/nominatim', '') + qs, request);
    }
    if (path.startsWith('/api/wikipedia/')) {
        const domain = params.get('domain') || 'en.wikipedia.org';
        return doProxy('https://' + domain + path.replace('/api/wikipedia', '') + qs, request);
    }
    if (path.startsWith('/api/bing/')) {
        const base = params.get('base') || 'cn.bing.com';
        return doProxy('https://' + base + path.replace('/api/bing', '') + qs, request);
    }
    if (path.startsWith('/api/baike/')) {
        return doProxy('https://baike.baidu.com' + path.replace('/api/baike', '') + qs, request);
    }
    return new Response('Unknown route', { status: 404, headers: corsHeaders });
}

async function doProxy(target, request) {
    try {
        const h = new Headers(request.headers);
        h.delete('cf-connecting-ip');
        h.delete('x-forwarded-for');
        h.delete('x-real-ip');
        h.set('User-Agent', 'AntipodeFinder/1.0 (Cloudflare Worker)');
        const resp = await fetch(target, { method: request.method, headers: h });
        const rh = new Headers(resp.headers);
        for (const [k, v] of Object.entries(corsHeaders)) rh.set(k, v);
        return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: rh });
    } catch (e) {
        return new Response('Proxy error: ' + e.message, { status: 502, headers: corsHeaders });
    }
}
"""

result = 'const INDEX_HTML = `' + escaped + '`;\n' + worker_code

with open('_worker.js', 'w', encoding='utf-8') as f:
    f.write(result)

# Verify
with open('_worker.js', 'r', encoding='utf-8') as f:
    c = f.read()

print('Wrote', len(result), 'bytes')
print('Has INDEX_HTML:', c.startswith('const INDEX_HTML'))
print('Has corsHeaders:', 'const corsHeaders' in c)
print('Has doProxy:', 'async function doProxy' in c)
idx = c.index('const corsHeaders')
print('Before corsHeaders:', repr(c[idx-3:idx]))
bt = '`'
tmpl_bt = c[:idx].count(bt)
print('Unescaped backticks in template:', tmpl_bt)
print('OK' if tmpl_bt == 1 else 'FAIL')
