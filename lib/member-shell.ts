export const MEMBER_SECTIONS = [
  { href: "/app/health", label: "Health", longLabel: "My Health" },
  { href: "/app/team", label: "Team", longLabel: "My Team" },
  { href: "/app/story", label: "Story", longLabel: "My Story" },
] as const;

export type MemberSectionHref = (typeof MEMBER_SECTIONS)[number]["href"];

export function isMemberSectionActive(pathname: string, href: MemberSectionHref) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function nextMenuIndex(
  currentIndex: number,
  direction: 1 | -1,
  itemCount: number,
) {
  if (itemCount <= 0) return -1;
  const safeCurrent = currentIndex >= 0 ? currentIndex : direction === 1 ? -1 : 0;
  return (safeCurrent + direction + itemCount) % itemCount;
}

export function memberShellPresentation(viewportWidth: number) {
  return viewportWidth >= 900
    ? { sidebar: true, sectionControl: false, orderBottomBar: false }
    : { sidebar: false, sectionControl: true, orderBottomBar: true };
}
