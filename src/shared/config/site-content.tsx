export const mainNavigation = [
  { key: "home", href: "/" },
  { key: "journal", href: "/journal" },
  { key: "realms", href: "/realms" },
  { key: "experiments", href: "/experiments" },
] as const;

export const heroStats = [
  { value: "IX", labelKey: "realmsMapped" },
  { value: "XLII", labelKey: "entriesGathered" },
  { value: "∞", labelKey: "questionsOpen" },
] as const;

export const adminSidebar = [
  { label: "Overview", href: "#overview" },
  { label: "Create entry", href: "#create-entry" },
  { label: "Journal", href: "#journal-entries" },
  { label: "Realms", href: "#realms-entries" },
  { label: "Experiments", href: "#experiments-entries" },
  { label: "Settings", href: "#publishing-rules" },
];
