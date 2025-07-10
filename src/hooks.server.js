/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const origin = event.request.headers.get('origin');

    if (origin && origin.includes('discord.com')) {

        console.log('Discord.com crawler detected, modifying response...');

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