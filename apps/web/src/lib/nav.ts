export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Studio", href: "/studio" },
  // labelled device-neutrally — desktop gets the interactive 3D room, phones
  // get the studio film in the same spot, so "3D" would overpromise on mobile
  { label: "The Room", href: "/#experience" },
  { label: "Projects", href: "/projects" },
  { label: "Materials", href: "/materials" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const ctaNav: NavItem = { label: "Start a Project", href: "/contact" };

export function isNavActive(href: string, pathname: string): boolean {
  if (href.includes("#") || !href.startsWith("/")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
