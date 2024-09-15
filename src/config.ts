const siteConfig = {
  name: "Bottles",
  description: "Bottles",
  WALRUS_PUBLISHER_URL: "https://publisher-devnet.walrus.space",
  WALRUS_AGGREGATOR_URL: "https://aggregator-devnet.walrus.space",
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
      label: "More",
      href: "/more",
    },
  ],
};

export default siteConfig;
export type SiteConfig = typeof siteConfig;
