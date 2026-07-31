import type { Routes } from '@angular/router';

export const APPLICATION_ROUTES: Routes = [
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full',
	},
	{
		path: 'home',
		loadComponent: () => import('../home/home').then((module) => module.Home),
		data: { title: 'Início', subtitle: 'Visão geral da sua operação' },
	},
	{
		path: 'servicos',
		loadComponent: () => import('../servicos/containers/servico.component').then((module) => module.ServicoComponent),
		data: { title: 'Serviços', subtitle: 'Gestão de serviços' },
	},
	{
		path: 'tabela-de-servicos',
		loadComponent: () =>
			import('../tabela-montagem/containers/tabela-montagem.component').then((module) => module.TabelaMontagemComponent),
		data: { title: 'Tabela de Montagem', subtitle: 'Catálogo e valores por cliente' },
	},
	{
		path: 'clientes',
		loadComponent: () => import('../clientes/containers/cliente.component').then((module) => module.ClienteComponent),
		data: { title: 'Clientes', subtitle: 'Gestão de clientes' },
	},
	{
		path: 'fornecedores',
		loadComponent: () =>
			import('../fornecedores/containers/fornecedor.component').then((module) => module.FornecedorComponent),
		data: { title: 'Fornecedores', subtitle: 'Gestão de fornecedores' },
	},
	{
		path: 'ordens-de-servico',
		loadComponent: () =>
			import('../ordens-de-servico/containers/ordem-servico.component').then((module) => module.OrdemServicoComponent),
		data: { title: 'Ordem de Serviço', subtitle: 'Acompanhamento da operação' },
	},
	{
		path: 'os/scan',
		loadComponent: () =>
			import('../ordens-de-servico/containers/os-scan.component').then((module) => module.OsScanComponent),
		data: { title: 'Scan de OS', subtitle: 'Lançamento via QR code' },
	},
	{
		path: 'impressao-os',
		loadComponent: () =>
			import('../impressao-os/containers/impressao-os.component').then((module) => module.ImpressaoOsComponent),
		data: { title: 'Central de Impressão', subtitle: 'QR code e folhas de OS' },
	},
	{
		path: 'faturamento',
		redirectTo: 'home',
		pathMatch: 'full',
	},
];
