export const searchTerms: string[] = [
  "basalt",
  "granite",
  "compass",
  "harbor",
  "lantern",
  "aqueduct",
  "windmill",
  "telescope",
  "sandstone",
  "reservoir",
  "canyon",
  "glacier",
];

export interface SearchTermChoice {
  term: string;
  source: "env" | "random";
}

export function pickSearchTerm(): SearchTermChoice {
  const fromEnv = process.env.SEARCH_TERM;
  if (fromEnv && fromEnv.trim().length > 0) {
    return { term: fromEnv.trim(), source: "env" };
  }
  const index = Math.floor(Math.random() * searchTerms.length);
  return { term: searchTerms[index], source: "random" };
}
