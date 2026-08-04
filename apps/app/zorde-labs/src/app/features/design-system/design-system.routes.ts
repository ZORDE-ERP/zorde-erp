import { Routes } from '@angular/router';

export const DESIGN_SYSTEM_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/overview/overview').then((m) => m.OverviewPage),
	},
	{
		path: 'foundations/colors',
		loadComponent: () => import('./pages/foundations/colors/colors').then((m) => m.ColorsPage),
	},
	{
		path: 'foundations/typography',
		loadComponent: () => import('./pages/foundations/typography/typography').then((m) => m.TypographyPage),
	},
	{
		path: 'foundations/spacing',
		loadComponent: () => import('./pages/foundations/spacing/spacing').then((m) => m.SpacingPage),
	},
	{
		path: 'foundations/borders',
		loadComponent: () => import('./pages/foundations/borders/borders').then((m) => m.BordersPage),
	},
	{
		path: 'foundations/shadows',
		loadComponent: () => import('./pages/foundations/shadows/shadows').then((m) => m.ShadowsPage),
	},
	{
		path: 'components/buttons',
		loadComponent: () => import('./pages/components/buttons/buttons').then((m) => m.ButtonsPage),
	},
	{
		path: 'components/links',
		loadComponent: () => import('./pages/components/links/links').then((m) => m.LinksPage),
	},
	{
		path: 'components/cards',
		loadComponent: () => import('./pages/components/cards/cards').then((m) => m.CardsPage),
	},
	{
		path: 'components/forms',
		loadComponent: () => import('./pages/components/forms/forms').then((m) => m.FormsPage),
	},
	{
		path: 'components/dropdowns',
		loadComponent: () => import('./pages/components/dropdowns/dropdowns').then((m) => m.DropdownsPage),
	},
	{
		path: 'components/feedback',
		loadComponent: () => import('./pages/components/feedback/feedback').then((m) => m.FeedbackPage),
	},
	{
		path: 'components/overlays',
		loadComponent: () => import('./pages/components/overlays/overlays').then((m) => m.OverlaysPage),
	},
	{
		path: 'components/tabs',
		loadComponent: () => import('./pages/components/tabs/tabs').then((m) => m.TabsPage),
	},
	{
		path: 'components/searchable-select',
		loadComponent: () =>
			import('./pages/components/searchable-select/searchable-select').then((m) => m.SearchableSelectPage),
	},
];
