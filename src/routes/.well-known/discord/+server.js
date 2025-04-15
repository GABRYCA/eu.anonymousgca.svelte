export const prerender = true;

export const GET = async () => {
    // Should print content for verification HTTPS: dh=8e0dd8e879d8469476e1370292b7ce713b6b886b
    // Return response
    return new Response(
        `dh=8e0dd8e879d8469476e1370292b7ce713b6b886b`,
        {
            headers: {
                'Content-Type': 'text/plain',
            },
        }
    )
}