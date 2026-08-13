import { Page, Locator } from "@playwright/test";
import { config } from "../helpers/config";

export interface SearchResult {
  title: string;
  url: string;
}

export class SearchPage {
  private readonly resultLinks: Locator;

  constructor(private readonly page: Page) {
    this.resultLinks = page.locator(".mw-search-result-heading a");
  }

  async openResultsFor(term: string): Promise<void> {
    const query = encodeURIComponent(term);
    const url = `${config.baseUrl}/w/index.php?search=${query}&fulltext=1&ns0=1`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async collectTopResults(limit: number): Promise<SearchResult[]> {
    await this.resultLinks.first().waitFor({ state: "visible" });
    const total = await this.resultLinks.count();
    const take = Math.min(limit, total);
    const results: SearchResult[] = [];
    for (let index = 0; index < take; index++) {
      const link = this.resultLinks.nth(index);
      const title = (await link.innerText()).trim();
      const href = await link.getAttribute("href");
      results.push({ title, url: new URL(href ?? "", config.baseUrl).toString() });
    }
    return results;
  }
}
