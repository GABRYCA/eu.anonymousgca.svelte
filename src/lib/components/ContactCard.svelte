<script>
	import { scrollAnimation } from '$lib/actions/scrollAnimation.js';

	/** @type {{aos_animation?: string, aos_delay?: number, title?: string, description?: string, icon?: string, link?: string, featured?: boolean, cta?: string}} */
	let {
		aos_animation = 'fade-up',
		aos_delay = 100,
		title = 'Github',
		description = '',
		icon = 'fab fa-github',
		link = 'https://github.com/GABRYCA',
		featured = false,
		cta = 'Open'
	} = $props();

	/**
	 * @param {string} url
	 */
	function getUrlWithoutHttps(url) {
		return url
			.replace(/https?:\/\/(www\.)?/, '')
			.replace(/\/$/, '')
			.replace(/mailto:/, '');
	}

	const external = $derived(!link.startsWith('mailto:'));
</script>

<div
	class={['contact-card-wrap', featured ? 'col-12 col-lg-4' : 'col-12 col-sm-6 col-lg-3']}
	use:scrollAnimation={{ animation: aos_animation, duration: 500, delay: aos_delay }}
>
	<a
		href={link}
		class={['contact-card', featured && 'contact-card--featured']}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		aria-label="{title}: {getUrlWithoutHttps(link)}"
	>
		<div class="contact-card__plane" aria-hidden="true"></div>
		<div class="contact-card__icon-ring" aria-hidden="true">
			<i class={icon}></i>
		</div>
		<div class="contact-card__body">
			<h3 class="contact-card__title">{title}</h3>
			<p class="contact-card__desc">{description}</p>
			<span class="contact-card__link">
				<span class="contact-card__url text-mono">{getUrlWithoutHttps(link)}</span>
				<span class="contact-card__cta">
					{cta}
					<i class="fas fa-arrow-right" aria-hidden="true"></i>
				</span>
			</span>
		</div>
	</a>
</div>

<style>
	.contact-card-wrap {
		display: flex;
	}

	.contact-card {
		--card-accent: var(--azure);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		width: 100%;
		min-height: 100%;
		padding: 1.35rem 1.25rem 1.25rem;
		border-radius: var(--radius-card);
		border: 1px solid var(--line);
		background: var(--surface);
		color: inherit;
		text-decoration: none;
		overflow: hidden;
		isolation: isolate;
		transition:
			transform 0.35s var(--ease-out-expo),
			border-color 0.25s ease,
			background-color 0.25s ease;
	}

	.contact-card--featured {
		min-height: 15.5rem;
		padding: 1.6rem 1.45rem 1.4rem;
	}

	.contact-card__plane {
		position: absolute;
		right: -1.5rem;
		top: -1.5rem;
		width: 6rem;
		height: 6rem;
		background: var(--azure-dark);
		transform: rotate(12deg);
		pointer-events: none;
		z-index: -1;
		transition:
			background-color 0.35s ease,
			transform 0.45s var(--ease-out-expo);
	}

	.contact-card__icon-ring {
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-card);
		border: 1px solid var(--line);
		background: var(--azure-soft);
		transition:
			background-color 0.35s ease,
			border-color 0.25s ease,
			color 0.35s ease;
	}

	.contact-card--featured .contact-card__icon-ring {
		width: 4rem;
		height: 4rem;
	}

	.contact-card__icon-ring i {
		font-size: 1.55rem;
		color: var(--azure);
		transition: color 0.35s ease;
	}

	.contact-card--featured .contact-card__icon-ring i {
		font-size: 1.85rem;
	}

	.contact-card__body {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 0.4rem;
	}

	.contact-card__title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--ink);
	}

	.contact-card--featured .contact-card__title {
		font-size: 1.4rem;
	}

	.contact-card__desc {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.95rem;
		line-height: 1.5;
		text-wrap: pretty;
	}

	.contact-card__link {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-top: auto;
		padding-top: 1rem;
	}

	.contact-card__url {
		font-size: 0.78rem;
		color: var(--ink-faint);
		word-break: break-all;
	}

	.contact-card__cta {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		width: fit-content;
		color: var(--azure);
		font-weight: 600;
		font-size: 0.92rem;
		transition:
			gap 0.25s var(--ease-out-expo),
			color 0.25s ease;
	}

	.contact-card:hover,
	.contact-card:focus-visible {
		transform: translateY(-4px);
		border-color: var(--azure-line);
		background: var(--surface-2);
		outline: none;
	}

	.contact-card:hover .contact-card__plane,
	.contact-card:focus-visible .contact-card__plane {
		background: var(--azure);
		transform: rotate(12deg) scale(1.12);
	}

	.contact-card:hover .contact-card__icon-ring,
	.contact-card:focus-visible .contact-card__icon-ring {
		background: var(--azure);
		border-color: var(--azure);
	}

	.contact-card:hover .contact-card__icon-ring i,
	.contact-card:focus-visible .contact-card__icon-ring i {
		color: #000;
	}

	.contact-card:hover .contact-card__cta,
	.contact-card:focus-visible .contact-card__cta {
		gap: 0.7rem;
		color: var(--gold);
	}

	.contact-card:focus-visible {
		outline: 2px solid var(--azure);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-card,
		.contact-card__plane,
		.contact-card__icon-ring,
		.contact-card__cta {
			transition: none;
		}

		.contact-card:hover,
		.contact-card:focus-visible {
			transform: none;
		}
	}
</style>
