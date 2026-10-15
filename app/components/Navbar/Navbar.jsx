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
import { FaGithub, FaStar } from "react-icons/fa";
import { REPO_URL } from "../../../utils/github";

const BROWSE_LINK = { href: "/browse", label: "Browse" };
const SECONDARY_LINKS = [
  { href: "/feature-request", label: "Feature Request" },
  { href: "/bug-report", label: "Bug Report" },
  { href: "/pass-the-torch", label: "Take Over" },
];
const SHARE_LINK = { href: "/add-student", label: "Share your story" };

const formatStars = (count) =>
  count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : String(count);

function GitHubContribute({ stars }) {
  const hasStars = Number.isFinite(stars);
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={hasStars ? `Contribute on GitHub, ${stars} stars` : "Contribute on GitHub"}
      className="inline-flex items-center overflow-hidden rounded-xl border border-amber-200 bg-white/70 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5">
        <FaGithub size={16} aria-hidden="true" />
        Contribute
      </span>
      <span className="inline-flex items-center gap-1 border-l border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs font-bold tabular-nums text-amber-700">
        <FaStar size={11} aria-hidden="true" />
        {hasStars ? formatStars(stars) : "Star"}
      </span>
    </a>
  );
}

export default function App({ stars = null }) {
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

        <NavbarItem className="ml-1 flex">
          <GitHubContribute stars={stars} />
        </NavbarItem>

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
