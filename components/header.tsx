"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Moon, Sun, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { languages } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { useStore } from "@/lib/store";
import { useMobile } from "@/hooks/use-mobile";
import SearchBar from "@/components/search-bar";
import UserAvatar from "@/components/user-avatar";

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useStore();

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        isScrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>

          {!isMobile && (
            <nav className="hidden gap-6 md:flex">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/" ? "text-primary" : "text-foreground/60"
                }`}
              >
                {t("common.home")}
              </Link>
              <Link
                href="/search"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/search" ? "text-primary" : "text-foreground/60"
                }`}
              >
                {t("common.search")}
              </Link>
              <Link
                href="/genres"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/genres" || pathname.startsWith("/genres/")
                    ? "text-primary"
                    : "text-foreground/60"
                }`}
              >
                {t("common.genre")}
              </Link>
              <Link
                href="/popular"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/popular"
                    ? "text-primary"
                    : "text-foreground/60"
                }`}
              >
                {t("common.popular")}
              </Link>
              <Link
                href="/recent"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/recent" ? "text-primary" : "text-foreground/60"
                }`}
              >
                {t("common.updated")}
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && !showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("common.search")}</span>
            </Button>
          )}

          {!isMobile && showSearch && (
            <div className="relative w-64">
              <SearchBar onClose={() => setShowSearch(false)} />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t("common.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={language === lang.value ? "bg-muted" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">
              {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
            </span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar user={user} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem>{t("common.profile")}</DropdownMenuItem>
                </Link>
                <Link href="/library">
                  <DropdownMenuItem>{t("common.bookmarks")}</DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem>{t("common.settings")}</DropdownMenuItem>
                </Link>
                {user.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem>Admin Panel</DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={() => useStore.getState().logout()}>
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">{t("common.login")}</span>
              </Button>
            </Link>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  <Link
                    href="/"
                    className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/" ? "text-primary" : "text-foreground/60"
                    }`}
                  >
                    {t("common.home")}
                  </Link>
                  <Link
                    href="/search"
                    className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/search"
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {t("common.search")}
                  </Link>
                  <Link
                    href="/genres"
                    className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/genres" || pathname.startsWith("/genres/")
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {t("common.genre")}
                  </Link>
                  <Link
                    href="/popular"
                    className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/popular"
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {t("common.popular")}
                  </Link>
                  <Link
                    href="/recent"
                    className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === "/recent"
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {t("common.updated")}
                  </Link>
                  {!user ? (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.login")}
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.register")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.profile")}
                      </Link>
                      <Link
                        href="/library"
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.bookmarks")}
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.settings")}
                      </Link>
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => useStore.getState().logout()}
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("common.logout")}
                      </button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
