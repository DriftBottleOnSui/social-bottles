export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Bottles",
  description: "Bottles",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Bottles",
      href: "/bottles",
    },
    {
      label: "State",
      href: "/state",
    },
    {
      label: "More",
      href: "/more",
    },
  ],
};
