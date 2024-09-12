import { useState } from "react";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { ConnectButton } from "@mysten/dapp-kit";
import clsx from "clsx";
import { useLocation, Link as RouterLink } from "react-router-dom";

import siteConfig from "@/config";

export const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <NextUINavbar
      className="bg-black h-24 flex items-center text-[#716C6C]"
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full justify-start items-center h-full">
        <NavbarBrand className="gap-3 max-w-fit">
          <RouterLink
            className="flex justify-start items-center gap-1 text-foreground"
            to="/"
          >
            <div className="h-16 w-16 flex items-center justify-center">
              <img
                alt="logo"
                className="max-h-full max-w-full object-contain"
                src="/logo.png"
              />
            </div>
          </RouterLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem
              key={item.href}
              className={clsx(
                "pt-6",
                "relative",
                location.pathname === item.href &&
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#FB0C0C]",
              )}
              isActive={location.pathname === item.href}
            >
              <RouterLink
                className={clsx(
                  "data-[active=true]:text-white data-[active=true]:font-medium",
                  "hover:text-white",
                  "text-4xl",
                )}
                data-active={location.pathname === item.href}
                to={item.href}
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
        <div className="flex mr-8">
          <div className="text-xl">
            <div className="label">Current Users: </div>
            <span className="text-white font-bold">192k+</span>
          </div>
          <div className="h-12 w-[2px] bg-[#787878] mx-6" />
          <div className="text-xl ">
            <div className="label">States: </div>
            <span className="font-bold text-green-500">19+</span>
          </div>
        </div>
        <ConnectButton className="bg-[#FB0C0C] text-white text-2xl font-bold px-6 py-2 rounded-lg hover:bg-[#D80A0A] transition-colors duration-300" />
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle className="navbar-menu-toggle" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <RouterLink
                className={clsx(
                  "text-[#716C6C] hover:text-white",
                  "text-4xl",
                  location.pathname === item.href
                    ? "text-white font-medium"
                    : "",
                )}
                to={item.href}
                onClick={closeMenu}
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
