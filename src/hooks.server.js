/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const userAgent = event.request.headers.get('user-agent') || '';

    if (userAgent.includes('Discordbot')) {

        console.log('Discordbot crawler detected, modifying response...');

        const response = await resolve(event);
        const originalHtml = await response.text();
        const modifiedHtml = originalHtml.replace(/<body[^>]*>.*?<\/body>/s, '<body></body>');
        const newHeaders = new Headers(response.headers);
        newHeaders.delete('Content-Length');
        newHeaders.set('Content-Length', Buffer.byteLength(modifiedHtml).toString());

        return new Response(modifiedHtml, {
            status: response.status,
            headers: newHeaders,
        });
    }

    return resolve(event);
}