import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import clsx from "clsx";
import { useLocation, Link as RouterLink } from "react-router-dom";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const location = useLocation();

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-black h-24 flex items-center "
    >
      <NavbarContent className="basis-1/5 sm:basis-full justify-start items-center h-full">
        <NavbarBrand className="gap-3 max-w-fit">
          <RouterLink
            to="/"
            className="flex justify-start items-center gap-1 text-foreground"
          >
            <div className="h-16 w-16 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </RouterLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem
              key={item.href}
              isActive={location.pathname === item.href}
              className={clsx(
                "pt-6",
                "relative",
                location.pathname === item.href &&
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#FB0C0C]"
              )}
            >
              <RouterLink
                to={item.href}
                className={clsx(
                  "data-[active=true]:text-white data-[active=true]:font-medium",
                  "text-[#716C6C] hover:text-white",
                  "text-4xl"
                )}
                data-active={location.pathname === item.href}
              >
                {item.label}
              </RouterLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full justify-end items-center h-full"
        justify="end"
      >
        <Button className="bg-[#FB0C0C] text-white text-2xl font-bold px-6 py-2 rounded-lg">
          Connect Wallet
        </Button>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle className="navbar-menu-toggle" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <RouterLink
                to={item.href}
                className={clsx(
                  "text-[#716C6C] hover:text-white",
                  "text-4xl", // 添加这个类
                  location.pathname === item.href
                    ? "text-white font-medium"
                    : ""
                )}
              >
                {item.label}
              </RouterLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
