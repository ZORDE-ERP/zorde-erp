import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';

export interface FolhaPdfPageData {
	nomeOtica: string;
	qrCodeDataUrl: string;
	codigoFolha: string;
	numeroOs?: string;
	clienteId?: number;
	logoUrl?: string;
	clienteLogoUrl?: string;
	labLogoUrl?: string;
	nomeLab?: string;
	contatoLab?: string;
	cnpjLab?: string;
	enderecoLab?: string;
	contato?: string;
	cnpj?: string;
	endereco?: string;
}

@Injectable()
export class OsFolhaPdfService implements OnModuleDestroy {
	private readonly logger = new Logger(OsFolhaPdfService.name);
	private browser: Browser | null = null;

	public async onModuleDestroy(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}

	private async getBrowser(): Promise<Browser> {
		if (!this.browser?.connected) {
			this.browser = await puppeteer.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			});
		}
		return this.browser;
	}

	public async generatePdf(folhas: FolhaPdfPageData[]): Promise<Buffer> {
		if (folhas.length === 0) {
			throw new BusinessRuleException('Nenhuma folha para gerar PDF');
		}

		const browser = await this.getBrowser();
		const page = await browser.newPage();

		try {
			const html = this.buildHtml(folhas);
			await page.setContent(html, { waitUntil: 'load' });
			await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => undefined);
			const pdf = await page.pdf({
				format: 'A4',
				printBackground: true,
				margin: { top: '8mm', right: '10mm', bottom: '8mm', left: '10mm' },
			});
			return Buffer.from(pdf);
		} catch (error) {
			this.logger.error('Falha ao gerar PDF de folhas de OS', error);
			throw new BusinessRuleException('Não foi possível gerar o PDF de impressão');
		} finally {
			await page.close().catch(() => undefined);
		}
	}

	private buildHtml(folhas: FolhaPdfPageData[]): string {
		const pages = folhas
			.map((folha, index) => {
				const codigo = folha.codigoFolha;

				// Lab Logo: custom image if labLogoUrl provided, otherwise official Castro & Melo brand logo
				const labLogoHtml = folha.labLogoUrl
					? `<div class="logo-box"><img src="${this.escapeAttr(this.buildPrintLogoUrl(folha.labLogoUrl))}" alt="Logo Laboratório" class="logo-img" /></div>`
					: `<div class="castro-melo-logo">
							<div class="logo-text">CASTRO <span class="ampersand">&amp;</span> MELO</div>
							<div class="logo-badge">Montagem de Óculos</div>
					   </div>`;

				// Client Logo: if present, render in client details section
				const clienteLogoUrl = folha.clienteLogoUrl || folha.logoUrl;
				const clienteLogoHtml = clienteLogoUrl
					? `<div class="client-logo-box"><img src="${this.escapeAttr(this.buildPrintLogoUrl(clienteLogoUrl))}" alt="Logo ${this.escapeAttr(folha.nomeOtica)}" class="client-logo-img" /></div>`
					: '';

				const nomeLab = folha.nomeLab || 'Laboratório Castro & Melo';
				const contatoLab = folha.contatoLab || '(14) 99839-4848 / (14) 99622-1108';
				const cnpjLab = folha.cnpjLab || '28.130.517/0001-14';
				const enderecoLab = folha.enderecoLab || 'Rua 9 de Julho, 1156 - Sala 13 - Marília - SP';

				return `
      <section class="page${index < folhas.length - 1 ? ' break' : ''}">
        <!-- VIA DO LABORATÓRIO / FECHAMENTO -->
        <article class="os-via main-via">
          <header class="header-section">
            <div class="brand-box">
              ${labLogoHtml}
            </div>
            <div class="company-contact">
              <p class="lab-name-heading">${this.escapeHtml(nomeLab)}</p>
              <p><strong>Fone:</strong> ${this.escapeHtml(contatoLab)}</p>
              <p><strong>CNPJ:</strong> ${this.escapeHtml(cnpjLab)}</p>
              <p>${this.escapeHtml(enderecoLab)}</p>
            </div>
          </header>

          <div class="os-title-banner">
            <h2>ORDEM DE SERVIÇO</h2>
            <span class="os-code-tag">Nº ${this.escapeHtml(codigo)}</span>
          </div>

          <div class="top-fields-grid">
            <div class="field-row client-details-row">
              <span class="field-label grow">CLIENTE: <strong class="client-name-text">${this.escapeHtml(folha.nomeOtica)}</strong></span>
              ${clienteLogoHtml}
            </div>
            <div class="field-row">
              <span class="field-label">CÓDIGO CLIENTE: <strong>${folha.clienteId ? `#${folha.clienteId}` : '—'}</strong></span>
              <span class="field-label">CÓDIGO OS: <strong>${this.escapeHtml(codigo)}</strong></span>
              <span class="field-label">CÓDIGO (ÓTICA): <i class="fill-line sm"></i></span>
            </div>
            <div class="field-row">
              <span class="field-label">DATA DE EMISSÃO: <i class="fill-line md"></i></span>
              <span class="field-label">DATA DE ENTREGA: <i class="fill-line md"></i></span>
            </div>
            <div class="field-row">
              <span class="field-label grow">TIPO DE LENTE: <i class="fill-line flex-grow"></i></span>
            </div>
            <div class="field-row">
              <span class="field-label grow">COLORAÇÃO: <i class="fill-line flex-grow"></i></span>
            </div>
          </div>

          <table class="dioptria-table" aria-label="Tabela de Dioptria">
            <thead>
              <tr>
                <th scope="col" colspan="2">DIOPTRIA</th>
                <th scope="col">ESF.</th>
                <th scope="col">CIL.</th>
                <th scope="col">EIXO</th>
                <th scope="col">D.N.P.</th>
                <th scope="col">ALT.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="2" class="row-type">LONGE</td>
                <td class="row-eye">O.D</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td class="row-eye">O.E</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td rowspan="2" class="row-type">PERTO</td>
                <td class="row-eye">O.D</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td class="row-eye">O.E</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>

          <div class="mid-measurements">
            <span>ADIÇÃO: <i class="fill-line xs"></i></span>
            <span>D.P.A.: <i class="fill-line xs"></i></span>
            <span>ARO: <i class="fill-line xs"></i></span>
          </div>

          <div class="checkbox-row">
            <span class="cb-item"><i class="cb-box"></i> Metal</span>
            <span class="cb-item"><i class="cb-box"></i> Acetato</span>
            <span class="cb-item"><i class="cb-box"></i> Fio de Nylon</span>
            <span class="cb-item"><i class="cb-box"></i> Parafuso</span>
          </div>

          <div class="obs-container">
            <p class="section-heading">OBSERVAÇÕES PARA O PEDIDO</p>
            <div class="obs-line"></div>
            <div class="obs-line"></div>
            <div class="obs-line"></div>
          </div>

          <footer class="main-footer">
            <div class="sign-block">
              <p class="sign-title">ASSINATURA DO CLIENTE:</p>
              <div class="sign-line"></div>
              <p class="disclaimer-text">NÃO NOS RESPONSABILIZAMOS POR ARMAÇÕES USADAS E LENTES DE CRISTAIS</p>
            </div>
            <div class="qr-container">
              <img class="qr-img" src="${this.escapeAttr(folha.qrCodeDataUrl)}" alt="QR Code OS ${this.escapeAttr(codigo)}" />
              <span class="qr-code-text">${this.escapeHtml(codigo)}</span>
            </div>
          </footer>
        </article>

        <!-- DASHER SEPARATOR -->
        <div class="cut-separator" aria-hidden="true">
          <span>✂ CORTE AQUI — VIA DO CLIENTE (CANHOTO)</span>
        </div>

        <!-- CANHOTO DO CLIENTE -->
        <article class="os-via canhoto-via">
          <header class="canhoto-header">
            <div class="canhoto-brand">
              <span class="canhoto-title">CANHOTO DO CLIENTE — COMPROVANTE DE OS</span>
              <span class="canhoto-cliente-name">CLIENTE: <strong>${this.escapeHtml(folha.nomeOtica)}</strong> ${folha.clienteId ? `(ID: #${folha.clienteId})` : ''}</span>
            </div>
            <div class="canhoto-os-num">
              Nº ${this.escapeHtml(codigo)}
            </div>
          </header>
          <div class="canhoto-body">
            <div class="canhoto-info">
              <div class="canhoto-row">
                <span>DATA DE EMISSÃO: <i class="fill-line sm"></i></span>
                <span>ENTREGA ESTIMADA: <i class="fill-line sm"></i></span>
                <span>CÓDIGO: <i class="fill-line sm"></i></span>
              </div>
              <div class="canhoto-row">
                <span>TIPO DE LENTE / SERVIÇO: <i class="fill-line flex-grow"></i></span>
              </div>
              <div class="canhoto-row sign-row">
                <span>RECEBIDO EM: _____/_____/_________</span>
                <span>ASSINATURA: <i class="fill-line md"></i></span>
              </div>
              <p class="disclaimer-text">NÃO NOS RESPONSABILIZAMOS POR ARMAÇÕES USADAS E LENTES DE CRISTAIS</p>
            </div>
            <div class="canhoto-qr">
              <img class="qr-img-sm" src="${this.escapeAttr(folha.qrCodeDataUrl)}" alt="QR Code Canhoto ${this.escapeAttr(codigo)}" />
              <span class="qr-code-text">${this.escapeHtml(codigo)}</span>
            </div>
          </div>
        </article>
      </section>`;
			})
			.join('\n');

		return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Ordem de Serviço</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111111;
      background: #ffffff;
      font-size: 10.5px;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      padding: 0;
      box-sizing: border-box;
    }
    .break {
      page-break-after: always;
      break-after: page;
    }

    /* Main OS Section */
    .main-via {
      border: 2px solid #111111;
      border-radius: 4px;
      padding: 8px 12px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #111111;
      padding-bottom: 6px;
      margin-bottom: 6px;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
      max-width: 65%;
    }
    .castro-melo-logo {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .castro-melo-logo .logo-text {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 19px;
      font-weight: 900;
      color: #000000;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: 1;
    }
    .castro-melo-logo .ampersand {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 19px;
      height: 19px;
      background-color: #b0b5b9;
      color: #111111;
      border-radius: 50%;
      font-family: 'Georgia', serif;
      font-style: italic;
      font-size: 13px;
      font-weight: normal;
    }
    .castro-melo-logo .logo-badge {
      background-color: #000000;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 1px;
      margin-top: 3px;
      letter-spacing: 0.4px;
      width: 100%;
      text-align: center;
    }
    .lab-name-heading {
      font-size: 10px;
      font-weight: 800;
      color: #111;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .logo-box {
      width: 56mm;
      height: 28mm;
      min-width: 56mm;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
    }
    .logo-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 56mm;
      max-height: 28mm;
      object-fit: contain;
      object-position: left center;
    }
    .logo-placeholder {
      width: 56mm;
      height: 28mm;
      border: 1px dashed #d0d0d0;
      background: #fafafa;
      border-radius: 3px;
    }
    .company-contact {
      text-align: right;
      font-size: 8.5px;
      color: #333333;
      line-height: 1.3;
    }

    /* OS Title Banner */
    .os-title-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f2f2f2;
      border: 1px solid #111111;
      padding: 4px 10px;
      margin-bottom: 8px;
      border-radius: 3px;
    }
    .os-title-banner h2 {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .os-code-tag {
      font-size: 13px;
      font-weight: 800;
      color: #c0392b;
    }

    /* Form Fields Grid */
    .top-fields-grid {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 8px;
    }
    .field-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .client-details-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .client-text-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .client-logo-box {
      height: 22px;
      max-width: 70px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .client-logo-img {
      max-height: 22px;
      max-width: 70px;
      object-fit: contain;
    }
    .field-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #222222;
      display: flex;
      align-items: flex-end;
      gap: 4px;
    }
    .field-label.grow {
      flex: 1;
    }
    .flex-grow {
      flex: 1;
    }
    .fill-line {
      display: inline-block;
      border-bottom: 1px solid #333333;
      height: 13px;
    }
    .fill-line.sm { width: 85px; }
    .fill-line.md { width: 140px; }
    .fill-line.xs { width: 55px; }

    /* Dioptria Table */
    table.dioptria-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 9.5px;
    }
    table.dioptria-table th, table.dioptria-table td {
      border: 1px solid #111111;
      text-align: center;
      padding: 3px 2px;
    }
    table.dioptria-table th {
      background: #eaeaea;
      font-weight: 800;
      font-size: 9px;
    }
    table.dioptria-table td.row-type {
      font-weight: 800;
      background: #f8f8f8;
      width: 65px;
    }
    table.dioptria-table td.row-eye {
      font-weight: 700;
      width: 35px;
    }
    table.dioptria-table td:not(.row-type):not(.row-eye) {
      height: 20px;
    }

    /* Mid Measurements & Checkboxes */
    .mid-measurements {
      display: flex;
      gap: 16px;
      font-size: 9.5px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .checkbox-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 8px;
      padding: 4px 8px;
      background: #fafafa;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
    .cb-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 9.5px;
      font-weight: 700;
    }
    .cb-box {
      width: 10px;
      height: 10px;
      border: 1px solid #111111;
      display: inline-block;
      background: #ffffff;
    }

    /* Observations */
    .obs-container {
      margin-bottom: 6px;
    }
    .section-heading {
      font-size: 9px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 3px;
      letter-spacing: 0.4px;
    }
    .obs-line {
      border-bottom: 1px solid #444444;
      height: 14px;
      margin-bottom: 3px;
    }

    /* Footer & Signature & QR */
    .main-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 4px;
    }
    .sign-block {
      flex: 1;
    }
    .sign-title {
      font-size: 9px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .sign-line {
      border-bottom: 1px solid #111111;
      height: 20px;
      margin-bottom: 4px;
    }
    .disclaimer-text {
      font-size: 7.5px;
      text-align: center;
      color: #333333;
      font-weight: 600;
    }

    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #333333;
      padding: 4px;
      border-radius: 4px;
      background: #ffffff;
      width: 82px;
    }
    .qr-img {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }
    .qr-code-text {
      font-size: 8px;
      font-weight: 800;
      text-align: center;
      margin-top: 2px;
    }

    /* Dashed Separator */
    .cut-separator {
      position: relative;
      text-align: center;
      margin: 6px 0;
    }
    .cut-separator::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      border-top: 1.5px dashed #555555;
    }
    .cut-separator span {
      position: relative;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8.5px;
      font-weight: 700;
      color: #555555;
    }

    /* Canhoto Section */
    .canhoto-via {
      border: 1.5px solid #111111;
      border-radius: 4px;
      padding: 6px 10px;
      background: #ffffff;
    }
    .canhoto-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #111111;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .canhoto-brand {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .canhoto-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }
    .canhoto-cliente-name {
      font-size: 9px;
      color: #222;
    }
    .canhoto-os-num {
      font-size: 11px;
      font-weight: 800;
      color: #c0392b;
    }
    .canhoto-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .canhoto-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .canhoto-row {
      display: flex;
      gap: 14px;
      font-size: 9px;
      font-weight: 700;
    }
    .canhoto-row.sign-row {
      margin-top: 2px;
    }
    .canhoto-qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #333333;
      padding: 3px;
      border-radius: 3px;
      background: #ffffff;
      width: 68px;
    }
    .qr-img-sm {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
  </style>
</head>
<body>
${pages}
</body>
</html>`;
	}

	private escapeHtml(value: string): string {
		return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
	}

	private escapeAttr(value: string): string {
		return this.escapeHtml(value).replaceAll("'", '&#39;');
	}

	/**
	 * Normaliza logo para impressão:
	 * - e_trim remove padding uniforme (ex.: PNG quadrado com logo horizontal no centro)
	 * - c_fit limita ao box do cabeçalho e rasteriza SVG (f_png) para o Puppeteer
	 */
	private buildPrintLogoUrl(logoUrl: string): string {
		if (!logoUrl.includes('res.cloudinary.com') || !logoUrl.includes('/upload/')) {
			return logoUrl;
		}

		// ~56mm x 28mm @ 150dpi ≈ 330x165px; w_660,h_330 dá margem para print
		// f_png primeiro: rasteriza SVG antes do trim; e_trim corta padding uniforme
		const transform = 'f_png,e_trim,c_fit,w_660,h_330,q_auto:good';
		return logoUrl.replace('/upload/', `/upload/${transform}/`);
	}
}
