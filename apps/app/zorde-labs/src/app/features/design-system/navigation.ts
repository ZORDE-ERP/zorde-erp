export interface PlaygroundNavItem {
	readonly label: string;
	readonly path: string;
	readonly description?: string;
}

export interface PlaygroundNavGroup {
	readonly title: string;
	readonly items: readonly PlaygroundNavItem[];
}

export const PLAYGROUND_NAVIGATION: readonly PlaygroundNavGroup[] = [
	{
		title: 'Início',
		items: [
			{
				label: 'Visão geral',
				path: '/playground',
				description: 'Mapa do catálogo e como usar o playground.',
			},
		],
	},
	{
		title: 'Foundations',
		items: [
			{ label: 'Cores', path: '/playground/foundations/colors' },
			{ label: 'Tipografia', path: '/playground/foundations/typography' },
			{ label: 'Espaçamento', path: '/playground/foundations/spacing' },
			{ label: 'Bordas', path: '/playground/foundations/borders' },
			{ label: 'Sombras', path: '/playground/foundations/shadows' },
		],
	},
	{
		title: 'Componentes',
		items: [
			{ label: 'Botões', path: '/playground/components/buttons' },
			{ label: 'Links', path: '/playground/components/links' },
			{ label: 'Cards', path: '/playground/components/cards' },
			{ label: 'Formulários', path: '/playground/components/forms' },
			{ label: 'Dropdowns', path: '/playground/components/dropdowns' },
			{ label: 'Feedback', path: '/playground/components/feedback' },
			{ label: 'Overlays', path: '/playground/components/overlays' },
			{ label: 'Tabs', path: '/playground/components/tabs' },
			{ label: 'Searchable Select', path: '/playground/components/searchable-select' },
		],
	},
];
