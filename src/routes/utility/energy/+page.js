export const prerender = true;

export const load = async ({}) => {
	return {
		title: 'Energia — Prezzi elettricità Italia - AnonymousGCA',
		locale: 'it_IT',
		description:
			"Grafico in tempo reale dei prezzi dell'elettricità in Italia (zona Nord, proxy PUN): prezzi orari day-ahead, fascia più economica, media/minimo/massimo e stimatore di costo in €/kWh. Dati client-side via energy-charts.info, fonte ufficiale GME.",
		keywords:
			'PUN, prezzo unico nazionale, prezzo energia elettrica Italia, costo kWh Italia, mercato elettrico, MGP, GME, energy-charts, grafico prezzi energia, AnonymousGCA'
	};
};
