import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private browserInitPromise: Promise<Browser> | null = null;
  private activeRenderJobs = 0;
  private readonly maxConcurrentRenderJobs = Number(
    process.env.PDF_MAX_CONCURRENT || 3,
  );
  private waitingQueue: Array<() => void> = [];

  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    if (this.browserInitPromise) {
      return this.browserInitPromise;
    }

    this.browserInitPromise = puppeteer
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .then((browser) => {
        this.browser = browser;
        this.browserInitPromise = null;
        return browser;
      })
      .catch((error) => {
        this.browserInitPromise = null;
        throw error;
      });

    return this.browserInitPromise;
  }

  private async acquireRenderSlot(): Promise<void> {
    if (this.activeRenderJobs < this.maxConcurrentRenderJobs) {
      this.activeRenderJobs += 1;
      return;
    }

    await new Promise<void>((resolve) => {
      this.waitingQueue.push(resolve);
    });

    this.activeRenderJobs += 1;
  }

  private releaseRenderSlot() {
    this.activeRenderJobs = Math.max(0, this.activeRenderJobs - 1);
    const next = this.waitingQueue.shift();
    if (next) {
      next();
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generatePdfFromUrl(url: string): Promise<Buffer> {
    await this.acquireRenderSlot();

    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      try {
        await page.goto(url, {
          waitUntil: 'networkidle0',
        });

        await page.waitForFunction(
          () =>
            (window as Window & { isRenderFinished?: boolean })
              .isRenderFinished === true,
          { timeout: 30000 },
        );

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0mm',
            right: '0mm',
            bottom: '0mm',
            left: '0mm',
          },
        });

        return Buffer.from(pdfBuffer);
      } finally {
        await page.close();
      }
    } finally {
      this.releaseRenderSlot();
    }
  }
}
