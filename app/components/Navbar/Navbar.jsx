"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { PiListBold } from "react-icons/pi";

const BROWSE_LINK = { href: "/browse", label: "Browse" };
const SECONDARY_LINKS = [
  // { href: "/stats", label: "Stats" },
  { href: "/feature-request", label: "Feature Request" },
  { href: "/bug-report", label: "Bug Report" },
  { href: "/pass-the-torch", label: "Take Over" },
];
const SHARE_LINK = { href: "/add-student", label: "Share your story" };

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // On the home page the hero already surfaces Browse + Share your story, so we
  // drop those from the navbar there to avoid duplication. They appear on every
  // other page.
  const isHome = pathname === "/";
  const links = isHome ? SECONDARY_LINKS : [BROWSE_LINK, ...SECONDARY_LINKS];
  const showCta = !isHome;

  const useGlass = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar
      maxWidth="xl"
      isBlurred={false}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        useGlass
          ? "border-b border-amber-100/70 bg-white/60 shadow-sm backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
      classNames={{ wrapper: "px-4 sm:px-6" }}
    >
      <NavbarBrand>
        <Link href="/" className="text-lg font-black tracking-tight text-amber-700">
          Placement Tales
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-1">
        {links.map((item) => (
          <NavbarItem key={item.href} className="hidden md:flex">
            <Link
              href={item.href}
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}

        {showCta && (
          <NavbarItem className="hidden md:flex">
            <Button
              as={Link}
              href={SHARE_LINK.href}
              radius="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-white shadow-md"
            >
              {SHARE_LINK.label}
            </Button>
          </NavbarItem>
        )}

        <NavbarItem className="md:hidden">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly radius="lg" variant="flat" className="bg-amber-100 text-amber-700">
                <PiListBold size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Navigation menu">
              {(showCta ? [...links, SHARE_LINK] : links).map((item) => (
                <DropdownItem key={item.href} href={item.href} className="text-amber-800">
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
