# Mindar Web — Product roadmap (2026)

## Monetization core

- **Private uploads via onboarding**: Registration should guide users to upload personal private materials, then use platform Agent capabilities to generate what they need — primary paid conversion lever.
- **Web-page generation (paid extension)**: Pages are easier to share than decks (send a URL), consume more credits, and can extend into member virtual spaces and other value-add services aligned with knowledge-management positioning.

## Power-user navigation (implemented direction)

### User profile

Paid users who already understand the product; they multitask across public libraries, private libraries, Agents, and Notes — similar to many notebooks and many ChatGPT threads.

### Problem

Category-only navigation forces users to open each area to find recent work; switching cost is too high.

### Solution

- Keep **Library**, **Agent**, and **Notes** as core categories.
- Under each category, show **5–10 recent items** sorted by last use.
- **More** opens the full list for that category.
- Section order (top → bottom): **Public libraries** → **Private libraries** → **Agents** → **Notes** (Agent before Notes because of higher frequency).
- **Plaza** stays a fixed, prominent entry; account/settings stay on the bottom-left icon rail.

Implementation: `WebRecentsNavPanel` + `lib/web-recent-usage.ts` (local persistence for demo).

## Multi-platform roles

| Platform | Focus |
|----------|--------|
| Mobile | Fast browsing, recording — targeted information capture |
| PC | Effective processing and production |

## Upcoming work

- [ ] Refine sidebar recents (sync with API, pin, search)
- [ ] Onboarding: guide private library upload after signup
- [ ] Agent quality on private corpora (generation grounded in user files)
- [ ] Public library catalog depth and quality
- [ ] In-library onboarding for new users (value + paywall)
- [ ] Feasibility: web-page generation SKU and credit model
- [ ] Mobile: browsing + recorder UX pass
