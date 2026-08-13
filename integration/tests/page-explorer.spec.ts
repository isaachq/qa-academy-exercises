import { test, expect } from "@playwright/test";
import { SearchPage, SearchResult } from "../src/pages/SearchPage";
import { ArticlePage } from "../src/pages/ArticlePage";
import { pickSearchTerm } from "../src/data/searchTerms";
import { config } from "../src/helpers/config";
import { Titles, Steps, Actions } from "../src/helpers/steps";

test(Titles.EXPLORE_TOP_RESULTS, async ({ page }, testInfo) => {
  const choice = pickSearchTerm();
  console.log(`[START] search term: ${choice.term} (source: ${choice.source})`);
  testInfo.annotations.push({ type: "search term", description: choice.term });

  const searchPage = new SearchPage(page);
  const articlePage = new ArticlePage(page);
  let results: SearchResult[] = [];

  await test.step(Steps.OPEN_SEARCH_RESULTS, async () => {
    await test.step(Actions.GOTO_SEARCH, async () => {
      await searchPage.openResultsFor(choice.term);
    });
  });

  await test.step(Steps.COLLECT_TOP_RESULTS, async () => {
    await test.step(Actions.READ_RESULT_LINKS, async () => {
      results = await searchPage.collectTopResults(config.resultsToVisit);
    });
    expect(results.length, `no results returned for "${choice.term}"`).toBe(config.resultsToVisit);
    console.log(`[OK] results collected: ${results.length}`);
  });

  await test.step(Steps.VISIT_EACH_RESULT, async () => {
    for (const result of results) {
      await test.step(`${Actions.OPEN_ARTICLE}: ${result.title}`, async () => {
        const load = await articlePage.open(result.url);

        expect(load.status, `page did not respond with 200 - ${result.url}`).toBe(200);
        await expect(
          articlePage.headingLocator(),
          `heading is not visible - ${result.url}`
        ).toBeVisible();
        console.log(`[OK] ${load.status} ${load.loadTimeMs} ms - ${result.url}`);

        if (load.loadTimeMs > config.loadTimeThresholdMs) {
          const over = `${load.loadTimeMs} ms over threshold ${config.loadTimeThresholdMs} ms`;
          const warning = `[WARN] load time ${over} - ${result.url}`;
          console.log(warning);
          testInfo.annotations.push({ type: "slow page", description: warning });
        }
      });
    }
  });
});
