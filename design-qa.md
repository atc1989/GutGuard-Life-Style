# Design QA — Member shell navigation and overlays

- Source visual truth: `C:\Users\najee\AppData\Local\Temp\codex-clipboard-f3ecd98e-45fa-4ed2-a78b-4fe7e7829dbb.png` and the three companion screenshots supplied in the same request.
- Implementation evidence: `design-qa-mobile.png`, `design-qa-account-menu.png`, `design-qa-notifications-sheet.png`, and `design-qa-desktop-drawer.png`.
- Viewports: mobile 375×812 CSS px; desktop 1200×900 CSS px.
- Pixels/density: primary source 483×901 px; implementation mobile full-page capture 360×1395 px and interaction captures 360×780 px; desktop capture 1200×900 px. Comparisons used the app-content region rather than the source browser/device surround.
- State: Story selected; account menu open; Notifications sheet open; locked GEMA drawer open.

## Full-view comparison evidence

- Typography retains Fraunces display text and Inter Tight UI text, with the same hierarchy and wrapping behavior as the supplied Story reference.
- Spacing follows the reference card rhythm while intentionally replacing the segmented control and large Order bar with the requested fixed four-item icon dock.
- Bone, paper, ultramarine, ink, gold focus, rules, radii, and elevation remain on the established Gutguard tokens.
- No raster imagery was required; all visible symbols use the existing Lucide icon dependency.
- Story copy and disclaimer are unchanged.

## Focused-region evidence

- Account menu: verified as an anchored pop-up; opening it leaves the page-body top unchanged. Notifications, Settings, and Sign out remain at least 44px high and support arrow keys/Escape.
- Notifications: verified as a mobile bottom sheet with scrim, grab handle, title, close control, focus trap, and focus restoration to the avatar.
- Desktop drawer: verified at 480px wide with one full-width sticky footer action and no duplicate Continue BASE control.
- Desktop shell: empty masthead removed; page title begins at 32px and the fixed sidebar remains the navigation/identity owner.

## Comparison history

1. Initial implementation showed insufficient space between the compact masthead and page title. Added 18px mobile body-top spacing and recaptured the production build.
2. Initial overlay-close check could restore focus to `body` after launching from a menu item that unmounted. Added a stable account-trigger fallback and verified focus returns to `#gg-account-trigger`.

## Findings

- No actionable P0, P1, or P2 issues remain.
- P3: the four-item bottom dock is intentionally denser and less purchase-dominant than the former full-width Order CTA; this is the requested navigation trade-off.

## Primary interactions tested

- Health/Team/Story links and active `aria-current` state.
- Order overlay trigger.
- Account menu open/close, outside dismissal, arrows, and Escape.
- Notifications bottom sheet open/close, focus trap, inert background, and trigger restoration.
- Desktop locked-GEMA right drawer and footer action.
- Browser console: no errors or warnings.

## Implementation checklist

- [x] Mobile bottom navigation with icons.
- [x] Compact brand/avatar masthead.
- [x] Floating account pop-up with Notifications.
- [x] Notifications bottom sheet/right drawer.
- [x] Animated scrim, bottom sheet, and right drawer.
- [x] Stronger safe-area-aware drawer footer.
- [x] Responsive overflow and accessibility verification.

final result: passed
