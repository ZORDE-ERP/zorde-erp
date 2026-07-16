import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';

export interface FolhaPdfPageData {
	nomeOtica: string;
	qrCodeUrl: string;
	codigoFolha: string;
	numeroOs?: string;
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
		if (!this.browser || !this.browser.connected) {
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
				margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
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
			.map(
				(folha, index) => `
      <section class="page${index < folhas.length - 1 ? ' break' : ''}">
        <header>
          <div class="brand">
            <h1>${this.escapeHtml(folha.nomeOtica)}</h1>
            <p class="subtitle">Montagens de Óculos</p>
          </div>
        </header>

        <p class="os-title">ORDEM DE SERVIÇO <span class="os-num">Nº ${this.escapeHtml(folha.numeroOs ?? '')}</span></p>

        <div class="top-fields">
          <div class="row">
            <span>DATA DE EMISSÃO <i class="fill sm"></i></span>
            <span>DATA DE ENTREGA <i class="fill sm"></i></span>
          </div>
          <div class="row">
            <span class="grow">CLIENTE <i class="fill lg"></i></span>
            <span>CÓDIGO <i class="fill xs"></i></span>
          </div>
          <div class="row"><span>TIPO DE LENTE <i class="fill md"></i></span></div>
          <div class="row"><span>COLORAÇÃO <i class="fill md"></i></span></div>
        </div>

        <table class="dioptria">
          <tr>
            <th>DIOPTRIA</th><th></th><th>ESF</th><th>CIL</th><th>EIXO</th><th>D.N.P.</th><th>ALT.</th>
          </tr>
          <tr><td rowspan="2" class="label">LONGE</td><td>O.D</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>O.E</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td rowspan="2" class="label">PERTO</td><td>O.D</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>O.E</td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>

        <div class="mid-fields">
          <span>ADIÇÃO: <i class="fill xs"></i></span>
          <span>D.P.A. <i class="fill xs"></i></span>
          <span>ARO: <i class="fill xs"></i></span>
        </div>

        <div class="checkboxes">
          <span><i class="box"></i>Metal</span>
          <span><i class="box"></i>Acetato</span>
          <span><i class="box"></i>Fio de Nylon</span>
          <span><i class="box"></i>Parafuso</span>
        </div>

        <p class="section-title">OBSERVAÇÕES PARA O PEDIDO</p>
        <div class="obs-line"></div>
        <div class="obs-line"></div>

        <p class="section-title">ASSINATURA DO CLIENTE:</p>
        <div class="sign-line"></div>
        <p class="disclaimer">NÃO NOS RESPONSABILIZAMOS POR ARMAÇÕES USADAS E LENTES DE CRISTAIS</p>

        <div class="qr-box">
          <img class="qr" src="${this.escapeAttr(folha.qrCodeUrl)}" alt="QR Code" />
          <p class="codigo">${this.escapeHtml(folha.codigoFolha)}</p>
        </div>
      </section>`,
			)
			.join('\n');

		return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 11px; }

    .page { position: relative; min-height: 100vh; padding-bottom: 120px; }
    .break { page-break-after: always; }

    header { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
    h1 { margin: 0; font-size: 20px; font-style: italic; }
    .subtitle { margin: 2px 0 0; font-size: 10px; color: #333; }

    .os-title { text-align: center; font-weight: 700; font-size: 13px; margin: 0 0 12px; position: relative; }
    .os-num { color: #c0392b; position: absolute; right: 0; }

    .top-fields { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .top-fields .row { display: flex; gap: 16px; }
    .grow { flex: 1; }
    .fill { display: inline-block; border-bottom: 1px solid #333; margin-left: 4px; }
    .fill.sm { width: 80px; }
    .fill.md { width: 220px; }
    .fill.lg { width: 260px; }
    .fill.xs { width: 60px; }

    table.dioptria { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    table.dioptria th, table.dioptria td { border: 1px solid #333; padding: 4px; text-align: center; }
    table.dioptria td.label { font-weight: 700; }
    table.dioptria td:not(.label) { height: 22px; }

    .mid-fields { display: flex; gap: 16px; margin-bottom: 10px; }

    .checkboxes { display: flex; gap: 14px; align-items: center; margin-bottom: 10px; }
    .box { display: inline-block; width: 10px; height: 10px; border: 1px solid #333; margin-right: 4px; }

    .section-title { text-align: center; font-size: 10px; font-weight: 700; margin: 0 0 6px; }
    .obs-line { border-bottom: 1px solid #333; height: 18px; margin-bottom: 6px; }
    .sign-line { border-bottom: 1px solid #333; height: 22px; margin-bottom: 6px; }
    .disclaimer { text-align: center; font-size: 8px; color: #333; margin: 0; }

    .qr-box {
      position: absolute; right: 0; bottom: 0; width: 100px; text-align: center;
    }
    .qr { width: 90px; height: 90px; object-fit: contain; }
    .codigo { margin: 4px 0 0; font-size: 10px; font-weight: 700; }
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
}
