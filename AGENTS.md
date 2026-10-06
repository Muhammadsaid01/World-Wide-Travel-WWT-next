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

## Community

### Existing Community Architecture

- Reuse the existing Community architecture and shared components.
- Travel Stories is already implemented with real backend GraphQL data.
- Reuse established Community patterns for:
  - authentication
  - pagination
  - search
  - sorting
  - loading/error/empty states
  - member/avatar rendering
  - responsive behavior
- Do not reintroduce mock Community data when a real backend contract exists.
- Do not duplicate existing article, comment, like, or member lookup logic.
- Keep feature-specific behavior separate when domain requirements differ.

### Travel Stories

- Travel Stories already supports real article listing, detail, creation, likes, and comments.
- Reuse its implementation patterns where appropriate.
- Do not rebuild or replace the existing Travel Stories flow while implementing Travel Mate.
- Changes to shared Community components must preserve existing Travel Stories behavior.

### Travel Mate

- Treat Travel Mate as a separate Community domain from BoardArticle/Travel Stories.
- Inspect the backend schema, resolvers, services, DTOs, enums, and models before implementing frontend GraphQL operations.
- Do not model Travel Mate as a BoardArticle unless the backend explicitly does so.
- Do not invent Travel Mate fields, statuses, filters, relationships, or mutations from the reference designs.
- Use only backend-supported search, filter, sort, pagination, and status values.
- Do not use static Travel Mate mock data when real backend support exists.
- Reference designs are visual targets only; their sample trips, travelers, counts, dates, destinations, and statuses are not production data.

### Travel Mate Routes

Preserve the existing routing conventions.

Expected feature areas include:

- Travel Mate listing
- Travel Mate detail
- Travel Mate creation
- My Travel Mates
- Join Requests

Do not create or rename routes until the existing project and backend contracts have been inspected.

### Join Requests

- Join-request behavior must use real backend-supported relationships and lifecycle states.
- Do not invent PENDING / ACCEPTED / REJECTED or other statuses unless confirmed by backend enums.
- Do not simulate join requests only in frontend state when backend persistence is required.
- Authentication and ownership checks must follow existing backend and frontend auth patterns.
- Capacity/full-state behavior must follow backend rules rather than being independently invented by the frontend.
- Accept/reject actions must use exact backend mutations and DTOs.
- Prevent frontend behavior from implying successful persistence before the backend confirms the operation.

### My Profile Integration

- Reuse the existing My Profile layout/sidebar and routing patterns.
- Do not create a second profile layout for Travel Mate.
- My Travel Mates and Join Requests must use real authenticated member data.
- Reuse existing current-user/auth state rather than introducing feature-specific authentication state.

## Completed Community Feature Contracts

## Travel Stories2

- Travel Stories is already implemented end-to-end with the real BoardArticle backend.
- Public list route: `/community/stories`.
- Detail route: `/community/stories/[id]`.
- Creation route: `/community/stories/create`.
- Do not reintroduce static or mock story data.
- Story navigation must use the real BoardArticle Mongo `_id`.
- Reuse the existing `ArticleCard`, `ArticleForm`, and `CommentSection` where applicable.
- Article categories must use the existing backend `ArticleCategory` enum.
- Do not invent unsupported tags, draft states, article statuses, or rich-text contracts.
- Article content is currently rendered safely as plain text. Do not introduce unsafe HTML rendering without an explicit backend-supported rich-text contract.
- Story likes use the existing `likeTargetBoardArticle` mutation and backend `meLiked` state.
- Story comments use the existing comments backend and `CommentSection`.
- Article/comment/like counters are backend-authoritative.

### Community Member Lookups

Different Community domains use different member relationships.

- BoardArticle author lookup:
  `BoardArticle.memberId -> Member._id`
- Comment author lookup:
  `Comment.memberId -> Member._id`
- Do not replace these with the generic agent-oriented `lookupMember` helper when the foreign-key relationship differs.
- Preserve feature-specific lookup helpers when required by the underlying schema.

## Travel Mate — Existing Implementation

Travel Mate is already implemented with the real backend.

### Routes

- Public listing: `/community/travel-mate`
- Public detail: `/community/travel-mate/[id]`
- My Travel Mates: `/mypage/travel-mates`
- Create Travel Mate: use the existing My Travel Mates creation route.
- Edit Travel Mate: use the existing Travel Mate edit route.
- Join Requests: use the existing My Page Join Requests route.

Do not create parallel Travel Mate routes or components without first checking the existing implementation.

### Components

Reuse the existing:

- `TravelMateBrowsePage`
- `TravelMateList`
- `TravelMateCard`
- `TravelMateDetail`
- `TravelMateForm`
- `TravelMateCreate`
- `TravelMateEdit`
- `MyTravelMates`
- `JoinRequests`

Do not reintroduce mock Travel Mate data.

### Travel Mate Join Lifecycle

The real lifecycle is already implemented.

Conceptually:

`USER -> Join Request -> PENDING -> APPROVED or REJECTED`

- Use the existing Travel Mate Join GraphQL/backend contracts.
- Do not create a second join-request model or frontend-only persistence layer.
- Pending requests may be cancelled according to the existing backend contract.
- Approved participants may leave according to the existing backend contract.
- Owners manage incoming requests through the existing Join Requests flow.
- Approval must respect real backend capacity.
- `currentMembers` is backend-authoritative.
- Do not independently maintain or fabricate participant counts on the frontend.
- Join deletion and approved-member count changes are protected by the backend transaction logic.
- `maxMembers` must never be reduced below the current approved traveler count.
- Participant/member data must use the existing Travel Mate member lookup.
- Do not implement persisted `FULL` or `CLOSED` lifecycle behavior unless the backend is explicitly extended first.

## Agent Request / Become an Agent

Agent Request is already implemented end-to-end.

### Canonical Promotion Flow

The only supported USER -> AGENT promotion flow is:

`USER -> Agent Request -> PENDING -> ADMIN review -> APPROVED -> AGENT`

or:

`USER -> Agent Request -> PENDING -> ADMIN review -> REJECTED -> Apply Again`

- Do not create another Agent application system.
- A USER must never directly promote itself to AGENT.
- Frontend code must never directly change `MemberType` to `AGENT`.
- Frontend code must never directly create the Agent record during approval.
- Direct admin USER -> AGENT member updates are intentionally blocked.
- Agent Request approval is the canonical promotion path.

### Member Agent Request

Member route:

`/mypage/agent-request`

Reuse the existing member-side Agent Request implementation.

The application uses only these backend-supported fields:

- `companyName`
- `businessNumber`
- `licenseNumber`
- `agentDescription`

Do not invent additional fields such as:

- document uploads
- verification images
- website
- address
- years of experience
- business certificates

unless the backend contract is explicitly extended.

Behavior:

- A member may have at most one PENDING request.
- PENDING requests cannot submit another application.
- REJECTED eligible USER members may apply again.
- Rejection reason comes from the backend.
- APPROVED state must not fake-update authentication state.

### Agent Approval Integrity

Backend approval is transactionally protected.

The approval flow:

1. Claims a still-PENDING request.
2. Validates the current Member from the database.
3. Checks Agent/business/license conflicts.
4. Creates the Agent.
5. Changes the active Member from USER to AGENT.
6. Marks the request APPROVED and records review audit fields.

- `AgentRequest.agentDescription` maps to `Agent.agentDesc`.
- Concurrent/double approval must remain impossible.
- At most one PENDING Agent Request per member is database-enforced.
- Historical APPROVED/REJECTED requests are allowed.
- Notification failure must not roll back an already committed primary Agent Request transition.
- Do not weaken these transaction or uniqueness guarantees to simplify frontend code.

### JWT After Agent Approval

Agent approval changes the database Member type, but an already-issued JWT can still contain `USER`.

Therefore:

- Do not manually modify JWT contents.
- Do not fake-update `currentUserVar` to AGENT.
- Do not introduce a separate role-refresh mechanism unless the backend officially supports it.
- An approved user should obtain a fresh authenticated session through the existing logout/login flow.

### Admin Agent Requests

Admin route:

`/admin/agent-requests`

Reuse the existing admin layout and authentication architecture.

Real backend operations include:

- `getAllAgentRequestsByAdmin`
- `approveAgentRequestByAdmin`
- `rejectAgentRequestByAdmin`

Rules:

- Only PENDING requests expose Approve/Reject actions.
- Approval must be performed only through `approveAgentRequestByAdmin`.
- Rejection must be performed only through `rejectAgentRequestByAdmin`.
- The frontend must not separately create an Agent or change MemberType.
- Rejection must use the backend-supported rejection reason.
- Pagination/filter/search/sort must use the actual backend inquiry contract.
- Use real `metaCounter.total`.
- Do not fabricate applicant profile information when `memberData` is not returned.
- Do not introduce N+1 member queries merely to decorate the admin list.

## Admin Architecture

- Reuse the existing admin layout and admin authentication patterns.
- `/admin/agent-requests` is an implemented admin route.
- Frontend ADMIN checks are for UX/navigation only; backend guards remain authoritative.
- Do not create another admin authentication system.
- Do not create parallel admin layouts, sidebars, or navigation systems.
- Extend existing admin scaffolds when implementing future backend-supported admin features.

## Server-Owned State and Data Integrity

The backend is authoritative for persisted state.

Do not create independent frontend persistence for:

- likes
- comment counts
- Travel Mate participant counts
- join-request status
- Agent Request status
- booking status
- member roles

After mutations, use:

- backend-returned authoritative values,
- Apollo cache synchronization, or
- refetching according to the existing feature pattern.

Permissions, ownership, role transitions, capacity rules, and multi-document state transitions must remain enforced by the backend.

Do not weaken backend transactions or authorization to simplify frontend implementation.

## Regression and Testing Rules

When changing shared Member, Community, Travel Mate, Agent Request, or authentication logic:

- Check affected existing consumers before changing shared helpers.
- Preserve feature-specific member lookup relationships.
- Preserve existing transaction boundaries for multi-document state transitions.
- Do not forge JWTs or impersonate users for runtime testing.
- Prefer normal authenticated flows and existing integration-test infrastructure.
- Do not manufacture unrelated production-like data merely to exercise UI states.
- Clean temporary QA records through normal application/backend behavior when practical.
- Report flows that could not be runtime-tested rather than claiming they were verified.
