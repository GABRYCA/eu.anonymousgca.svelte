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

    const robotsContent = $derived(index ? `index, follow${imageURL ? ", max-image-preview:large" : ""}` : "noindex");

    const jsonLdObject = $derived({
        "@context": "https://schema.org",
        "@type": schemaType.length > 1 ? schemaType : schemaType[0],
        name: name,
        url: page.url.origin,
        image: imageURL,
        logo: {
            "@type": "ImageObject",
            "url": logo,
            "width": 48,
            "height": 48
        },
        "sameAs": socials,
        ...jsonld
    });

    const tag = $state('script');
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

    {#if schemaOrg && (socials.length > 0 || logo || name)}
        <svelte:element
                this={tag}
                type="application/ld+json"
        >
            {JSON.stringify(jsonLdObject)}
        </svelte:element>
    {/if}

    {@render children?.()}
</svelte:head>