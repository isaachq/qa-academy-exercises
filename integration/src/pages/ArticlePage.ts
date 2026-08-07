import { Page, Locator } from "@playwright/test";

export interface ArticleLoad {
  status: number;
  loadTimeMs: number;
  headingText: string;
}

export class ArticlePage {
  private readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator("#firstHeading");
  }

  async open(url: string): Promise<ArticleLoad> {
    const startedAt = Date.now();
    const response = await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.heading.waitFor({ state: "visible" });
    const loadTimeMs = Date.now() - startedAt;
    return {
      status: response ? response.status() : 0,
      loadTimeMs,
      headingText: (await this.heading.innerText()).trim(),
    };
  }

  headingLocator(): Locator {
    return this.heading;
  }
}
