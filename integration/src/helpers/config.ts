export const config = {
  baseUrl: process.env.BASE_URL ?? "https://en.wikipedia.org",
  resultsToVisit: Number(process.env.RESULTS_TO_VISIT ?? 3),
  loadTimeThresholdMs: Number(process.env.LOAD_TIME_THRESHOLD_MS ?? 4000),
};
