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
  { href: "/search", label: "Search" },
  { href: "/saved", label: "Saved" },
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
          ? "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
      classNames={{ wrapper: "px-4 sm:px-6" }}
    >
      <NavbarBrand>
        <Link href="/" className="text-lg font-black tracking-tight text-slate-900">
          Placement Tales
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-1">
        {links.map((item) => (
          <NavbarItem key={item.href} className="hidden md:flex">
            <Link
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
              radius="md"
              className="bg-slate-900 font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              {SHARE_LINK.label}
            </Button>
          </NavbarItem>
        )}

        <NavbarItem className="md:hidden">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly radius="md" variant="flat" className="bg-slate-100 text-slate-700">
                <PiListBold size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Navigation menu">
              {(showCta ? [...links, SHARE_LINK] : links).map((item) => (
                <DropdownItem key={item.href} href={item.href} className="text-slate-700">
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
