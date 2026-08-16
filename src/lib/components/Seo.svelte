<script>
    import {page} from "$app/state";

    /**
     * @type {{
     * children?: import('svelte').Snippet,
     * title?: string,
     * description?: string,
     * keywords?: string,
     * canonical?: string,
     * siteName?: string,
     * imageURL?: string,
     * logo?: string,
     * type?: string,
     * author?: string,
     * name?: string,
     * index?: boolean,
     * twitter?: boolean,
     * openGraph?: boolean,
     * schemaOrg?: boolean,
     * schemaType?: string[],
     * socials?: string[],
     * locale?: string,
     * jsonld?: Record<string, any>
     * }}
     */
    const {children, ...rest} = $props();

    // Priority: page.data > props > default
    const title = $derived(page.data.title ?? rest.title ?? "");
    const description = $derived(page.data.description ?? rest.description ?? "");
    const keywords = $derived(page.data.keywords ?? rest.keywords ?? "");
    const canonical = $derived(page.data.canonical ?? rest.canonical ?? page.url.href);
    const siteName = $derived(page.data.siteName ?? rest.siteName ?? "");
    const imageURL = $derived(page.data.imageURL ?? rest.imageURL ?? "");
    const logo = $derived(page.data.logo ?? rest.logo ?? "");
    const type = $derived(page.data.type ?? rest.type ?? "website");
    const author = $derived(page.data.author ?? rest.author ?? "");
    const name = $derived(page.data.name ?? rest.name ?? "");

    const index = $derived(page.data.index ?? rest.index ?? true);
    const twitter = $derived(page.data.twitter ?? rest.twitter ?? true);
    const openGraph = $derived(page.data.openGraph ?? rest.openGraph ?? true);
    const schemaOrg = $derived(page.data.schemaOrg ?? rest.schemaOrg ?? false);

    const schemaType = $derived(page.data.schemaType ?? rest.schemaType ?? ['Person', 'Organization']);
    const socials = $derived(page.data.socials ?? rest.socials ?? []);
    const jsonld = $derived(page.data.jsonld ?? rest.jsonld ?? {});

    const locale = $derived(page.data.locale ?? rest.locale ?? "en_US");
    const origin = $derived(page.url.origin);
    const pathname = $derived(page.url.pathname);

    const robotsContent = $derived(index ? `index, follow${imageURL ? ", max-image-preview:large" : ""}` : "noindex");

    const jsonLdGraph = $derived.by(() => {
        if (!schemaOrg) return null;

        const identityType = schemaType.length > 1 ? schemaType : schemaType[0];
        const graph = [
            {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                url: origin,
                name: siteName || name || title,
                inLanguage: locale.replace('_', '-'),
                ...(imageURL ? {image: imageURL} : {}),
                publisher: {'@id': `${origin}/#identity`}
            },
            {
                '@type': identityType,
                '@id': `${origin}/#identity`,
                name,
                ...(siteName ? {alternateName: siteName} : {}),
                url: origin,
                ...(imageURL ? {image: imageURL} : {}),
                ...(logo ? {logo: {'@type': 'ImageObject', 'url': logo, 'width': 48, 'height': 48}} : {}),
                ...(socials.length > 0 ? {sameAs: socials} : {}),
                ...jsonld
            }
        ];

        if (pathname !== '/') {
            const segments = pathname.split('/').filter(Boolean);
            let acc = '';
            const itemListElement = [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': origin}];
            segments.forEach((segment, index) => {
                acc += `/${segment}`;
                itemListElement.push({
                    '@type': 'ListItem',
                    'position': index + 2,
                    'name': segment.charAt(0).toUpperCase() + segment.slice(1),
                    'item': origin + acc
                });
            });
            graph.push({'@type': 'BreadcrumbList', '@id': `${origin}/#breadcrumb`, 'itemListElement': itemListElement});
        }

        return {'@context': 'https://schema.org', '@graph': graph};
    });

    const tag = 'script';
</script>

<svelte:head>
    {#if title}
        <title>{title}</title>
        <meta name="robots" content={robotsContent}>
        <link rel="canonical" href={canonical}>
    {/if}

    {#if description}
        <meta name="description" content={description}>
    {/if}

    {#if keywords}
        <meta name="keywords" content={keywords}>
    {/if}

    {#if author}
        <meta name="author" content={author}>
    {/if}

    {#if openGraph}
        {#if locale}
            <meta property="og:locale" content={locale}>
        {/if}
        {#if siteName}
            <meta property="og:site_name" content={siteName}>
        {/if}
        {#if title}
            <meta property="og:url" content={page.url.href}>
            <meta property="og:type" content={type}>
            <meta property="og:title" content={title}>
        {/if}
        {#if description}
            <meta property="og:description" content={description}>
        {/if}
        {#if imageURL}
            <meta property="og:image" content={imageURL}>
            {#if title}
                <meta property="og:image:alt" content={title}>
            {/if}
        {/if}
        {#if logo}
            <meta property="og:logo" content={logo}>
        {/if}
    {/if}

    {#if twitter}
        {#if title}
            <meta name="twitter:card" content="summary_large_image">
            <meta property="twitter:domain" content={page.url.hostname}>
            <meta property="twitter:url" content={page.url.href}>
            <meta name="twitter:title" content={title}>
        {/if}
        {#if description}
            <meta name="twitter:description" content={description}>
        {/if}
        {#if imageURL}
            <meta name="twitter:image" content={imageURL}>
        {/if}
    {/if}

    {#if schemaOrg && (name || siteName)}
        <svelte:element
                this={tag}
                type="application/ld+json"
        >
            {JSON.stringify(jsonLdGraph)}
        </svelte:element>
    {/if}

    {@render children?.()}
</svelte:head>