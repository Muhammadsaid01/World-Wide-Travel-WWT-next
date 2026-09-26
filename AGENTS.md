# Existing Architecture — Do Not Rebuild

The following foundations are already implemented and should be reused rather than recreated.

## Apollo / GraphQL

- Apollo Client is already configured.
- Reuse the existing Apollo client, cache, upload link, and authentication link.
- Do not create another Apollo client.
- Do not create duplicate GraphQL transport/configuration.
- Use the existing environment/config values for API and GraphQL URLs.
- Use exact backend resolver names, argument names, DTOs, return types, and enums.
- Inspect backend contracts before creating or modifying GraphQL operations.

### Authentication

- The authentication foundation already exists.
- Reuse the existing auth helpers and reactive auth state.
- Reuse `currentUserVar` for the current JWT-derived user state.
- Reuse the existing JWT storage/restore/logout logic.
- Do not create a second authentication system.
- Do not duplicate token parsing or token storage.
- Do not invent refresh-token behavior if the backend does not support it.
- JWT-derived state must use the existing `CustomJwtPayload` type.
- Full member/profile data must use the existing `Member` model/type rather than treating JWT data as a complete profile.
- Authentication/storage access must remain SSR-safe.

### Login / Signup

- Login and Signup already use the shared authentication flow.
- Preserve the existing sliding authentication UI unless the task explicitly requests a redesign.
- Do not create duplicate Login or Signup pages/components unnecessarily.
- Do not create an additional auth-specific Navbar or Footer.
- Public auth pages must use the existing public layout.
- Preserve existing login/signup validation and backend-aligned input fields.

### Layout

- Reuse the existing `PublicLayout` / `withLayout` implementation.
- Navbar and Footer must be rendered only once.
- Do not wrap a page in `withLayout` more than once.
- Shared feature components must not independently render the global Navbar or Footer unless explicitly designed to be standalone.
- Do not create duplicate global layouts.

### Navbar

- Navbar authentication state is already connected to the existing auth state.
- Logged-out and logged-in Navbar behavior must reuse the existing implementation.
- Do not create separate token checks inside Navbar.
- Logout must use the existing logout/auth helper.
- Preserve desktop/mobile consistency.
- Do not implement wishlist or notification backend behavior unless explicitly requested and supported by backend APIs.

## Travel Packages

### Package Listing

- The Packages list already uses the real backend GraphQL API.
- Do not reintroduce mock package data.
- Pagination uses the real backend contract.
- The current target page size is 9 packages per page.
- Desktop package grid is 3 columns; tablet is 2 columns; mobile is 1 column.
- Search/filter/sort controls must use only backend-supported fields.
- Do not hardcode fake package counts or page counts.
- Do not create fake destination/filter options unless they come from backend-supported enums/data.
- Unsupported filters should be omitted rather than simulated.

### Package Cards

- Reuse the existing `PackageCard` component.
- Package cards navigate using the real package `_id`.
- Preserve existing detail navigation behavior.
- Do not make visual favorite/heart controls imply real wishlist persistence unless wishlist backend support is implemented.
- Do not fabricate price semantics such as "From" or "/ person" unless the backend contract confirms them.

### Package Detail

- The package detail route already exists at `/package/[id]`.
- Use the real backend package `_id` for detail navigation.
- Reuse the existing single-package GraphQL query.
- The detail page must render only real backend-supported fields.
- Do not fabricate gallery images, itinerary items, inclusions, exclusions, tags, agent relationships, reviews, policies, or related-package relationships.
- If a backend field/relationship is unavailable, omit that section.
- Existing package review queries and pagination should be reused.
- Related-package behavior should reuse the existing backend-supported query/filter approach.
- Do not duplicate the package-detail data-fetching logic.

### Package Images

- Use real backend image fields and existing image-resolution logic.
- Do not duplicate one image multiple times to fake a gallery.
- If no valid image is available, use the existing fallback state.
- Do not hardcode external Stitch/reference image URLs into production components.

### Package Policy

- Do not implement frontend workarounds for broken backend package-policy logic.
- If the backend policy resolver/service is broken, report that a backend fix is required.

## Booking

- Reuse the existing booking routes, booking DTOs, GraphQL operations, and lifecycle.
- Do not create duplicate booking flows.
- Booking data must remain tied to real package/schedule/traveler backend contracts.
- Preserve real booking identifiers and backend-returned status.
- Do not hardcode availability or schedules.
- Do not bypass authentication requirements for protected booking operations.

## UI / Design Reference Rules

- Stitch/HTML/reference designs are visual references only.
- Do not copy standalone HTML documents directly into the Next.js project.
- Do not add Tailwind/CDN scripts because a reference design uses them.
- Translate reference designs into the existing MUI + SCSS + MaterialTheme architecture.
- Reference images/text/data must not become production mock data unless explicitly requested.
- Preserve the existing WWT visual system and shared components before introducing new styling patterns.

## Validation

After meaningful frontend changes, run:

- `yarn tsc --noEmit`
- `yarn lint`
- `git diff --check`

Also run the existing SCSS compile/check workflow when SCSS changes are substantial.

Do not report a task as complete while these checks are failing unless the failure is clearly pre-existing and explicitly reported.
