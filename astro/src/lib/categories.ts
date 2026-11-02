// Filter categories for the project list, derived from each project's free-text `tags` and `meta`.
// To recategorise a project, edit its tags in src/data/projects.json (or add `"categories": [...]`).
export const CATEGORIES = [
  { id: "identity", label: "Identity" },
  { id: "web", label: "Websites & digital" },
  { id: "apps", label: "Apps & UI" },
  { id: "other", label: "Print & other" },
  { id: "school", label: "School & internships" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

const RULES: [CategoryId, RegExp][] = [
  ["identity", /\b(logo|logotype|identity|brand)\b/i],
  // A domain as the title (MarieB.Ambi.cz) is a website, whatever the tags say (e.g. Art-Direction)
  ["web", /\b(web|website|webdesign|digital)\b|\.(cz|com|org|tv|sk)\b/i],
  ["apps", /\b(user interface|app)\b/i],
  ["other", /\b(apparell?|illustrations?|cd design|merch|print)\b/i],
];

export function categoriesFor(project: { title: string; tags: string; meta: string; categories?: string[] }): CategoryId[] {
  if (project.categories?.length) return project.categories as CategoryId[];
  const text = `${project.title} ${project.tags}`;
  const found = RULES.filter(([, re]) => re.test(text)).map(([id]) => id);
  if (/\b(diploma|bachelor|internship)\b/i.test(project.meta)) found.push("school");
  return found.length ? found : ["other"];
}
