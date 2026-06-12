# PRD: JWT-Embedded Permission System for Location Management

## Problem Statement

Staff and admin users can currently access any protected API endpoint as long as they hold the correct role (`staff` or `admin`). There is no fine-grained control over which specific operations a user can perform within a module. For example, a staff member assigned to one location can call mutation endpoints for any location — the system cannot distinguish between "staff who may create locations" and "staff who may only read them". Administrators have no way to restrict individual users to a specific subset of operations within a module.

## Solution

Introduce a `module:action` permission model where each protected operation is guarded by a named permission (e.g., `location_mgmt:create`). A user's effective permissions are fetched from the database at login and token refresh, then embedded as a flat list in the signed JWT access token. The middleware reads permissions directly from the verified JWT claims — no database query per request. Location management routes are the first module to be wired with this system.

## User Stories

1. As an admin, I want to grant a staff member `location_mgmt:create` permission, so that they can create new locations without having blanket access to all mutations.
2. As an admin, I want to grant a staff member `location_mgmt:update` permission, so that they can manage equipment, addons, pricing tiers, and unavailabilities for existing locations.
3. As an admin, I want to grant a staff member `location_mgmt:delete` permission, so that they can remove locations they are responsible for.
4. As an admin, I want to grant a staff member `location_mgmt:read` permission, so that they can view admin-only location data such as staff assignments and unavailability lists.
5. As an admin, I want to revoke a staff member's `location_mgmt:create` permission, so that they can no longer create new locations; the change takes effect within 15 minutes.
6. As a staff member with `location_mgmt:update`, I want to add equipment to a location, so that the location listing stays accurate without needing a separate permission for each sub-resource.
7. As a staff member with `location_mgmt:update`, I want to add, edit, or remove addons on a location, so that I can manage the location's full configuration with a single permission.
8. As a staff member with `location_mgmt:update`, I want to add or remove pricing tiers on a location, so that I can keep pricing current.
9. As a staff member with `location_mgmt:update`, I want to create or delete unavailability windows on a location, so that I can block out maintenance periods.
10. As a staff member without `location_mgmt:delete`, I want to receive a clear `403 Forbidden` response when I attempt to delete a location, so that I understand the action is not permitted rather than experiencing a silent failure.
11. As a requester (unauthenticated or authenticated), I want to browse locations and availability without needing any `location_mgmt` permission, so that I can make booking decisions freely.
12. As any authenticated user, I want my JWT access token to automatically contain my current permissions after login, so that I do not need to make a separate API call to discover what I can do.
13. As any authenticated user, I want my refreshed access token to reflect the latest permissions assigned to me, so that permission grants or revocations by an admin take effect within one token refresh cycle (at most 15 minutes).
14. As an admin, I want my JWT to embed all permissions (since the admin role is seeded with full permissions), so that I can perform all `location_mgmt` operations without manual permission assignment.
15. As a requester, I want my JWT to embed only requester-appropriate permissions, so that I cannot call staff or admin endpoints even if I craft a request manually.
16. As a developer, I want the permission check middleware to read from JWT claims rather than querying the database, so that protected endpoints remain fast under load.
17. As a developer, I want permission module names to use underscore notation (`location_mgmt`, `upload_doc`), so that the naming is consistent across all seeded permissions and no DB migration is needed.

## Implementation Decisions

- **Permission format**: A flat `[]string` of `module:action` strings (e.g., `["location_mgmt:create", "location_mgmt:update"]`) is added to the JWT `Claims` struct as `Permissions []string`. No map or nested structure.

- **JWT signature as trust anchor**: The middleware does not query the database per request. It reads `permissions` from the Gin context, which is populated by `AuthMiddleware` only after the JWT signature is verified. A tampered token fails signature verification and is rejected as `401` before any permission check occurs.

- **Token generation**: `GenerateTokenPair` accepts a `permissions []string` parameter in addition to the existing `userID`, `email`, `role`, and `secret` arguments. Both the access token and the refresh token embed the permissions.

- **Login and refresh**: `AuthService.Login` and `AuthService.Refresh` both fetch the user's effective permissions from the database before calling `GenerateTokenPair`. The `AuthService` is injected with a `PermissionRepository`. Permissions are fetched by resolving the union of: (a) permissions directly assigned to the user, and (b) permissions inherited from the user's roles.

- **Staleness window**: Access tokens expire in 15 minutes. Permission changes are guaranteed to take effect within one access token TTL. Token refresh always re-fetches permissions, so changes are picked up on the next refresh cycle regardless of the 7-day refresh token lifetime.

- **`role` is retained in the JWT**: The existing `role` claim (`admin`, `staff`, `requester`) stays in the JWT alongside `permissions`. Role-based guards (`RequireRole`) continue to protect profile endpoints that are structurally role-shaped. `RequirePermission` is added on top for module-level access control. The two middleware are independent and composable.

- **Middleware replacement**: The existing `RequirePermission(checker PermissionChecker, module, action string)` is replaced with `RequirePermission(module, action string)`. The `PermissionChecker` interface is removed. The new implementation reads `ctx.GetStringSlice("permissions")` and checks for the string `"module:action"`. The database-backed `UserHasPermission` method on `PermissionRepository` is retained for potential admin tooling but is no longer called on the request path.

- **`location_mgmt` action mapping**:
  - `POST /locations` → `location_mgmt:create`
  - `PUT /locations/:id` → `location_mgmt:update`
  - `DELETE /locations/:id` → `location_mgmt:delete`
  - `GET /locations/:id/unavailabilities` → `location_mgmt:read`
  - `GET /locations/:id/staff` → `location_mgmt:read`
  - All sub-resource mutations (POST/DELETE on equipments, addons, pricing-tiers, unavailabilities, staff assignments) → `location_mgmt:update`

- **Sub-resource action rationale**: Adding or removing equipment, addons, pricing tiers, and unavailabilities are treated as `update` operations on the parent location, not `create`/`delete`. A user who can update a location can manage all its sub-resources with a single permission.

- **Seed data**: Four new permissions are added to the seed: `location_mgmt:create`, `location_mgmt:read`, `location_mgmt:update`, `location_mgmt:delete`. All four are assigned to the `admin` role (consistent with the existing pattern of giving admin all permissions). Staff receive permissions individually via admin assignment.

- **Naming convention**: All module names use underscore notation. `location_mgmt` (not `location-mgmt`). `upload_doc` (not `documents`). No existing seed values are renamed.

- **Scope**: Only `location_mgmt` routes are wired with `RequirePermission` in this feature. `booking`, `payment`, `upload_doc`, and `user_mgmt` are seeded but not yet wired to route middleware — that is out of scope.

## Testing Decisions

A good test verifies external behavior: given inputs (JWT claims, request context), what does the middleware or function return? Tests must not assert on private fields, internal function calls, or implementation details like which DB query ran.

**`internal/pkg/jwt` — unit tests**
- Verify that `GenerateTokenPair` embeds the provided `permissions` slice in the access token claims.
- Verify that `ParseToken` returns a `Claims` struct whose `Permissions` field matches what was embedded — round-trip fidelity.
- Verify that an empty permissions slice produces a valid token (zero-length slice, not nil panic).
- Prior art: pure function tests; no infrastructure needed. Similar in style to `promptpay_test.go`.

**`internal/middleware/permission.go` — unit tests**
- Verify that `RequirePermission("location_mgmt", "create")` calls `ctx.Next()` when `"location_mgmt:create"` is present in context permissions.
- Verify that `RequirePermission("location_mgmt", "create")` aborts with `403` when the permission is absent.
- Verify that a missing or zero `user_id` in context aborts with `401`.
- Use a real `*gin.Engine` in test mode with a fake handler downstream to observe whether `Next()` or `Abort()` was called. No database, no real JWT needed — inject claims directly via `ctx.Set`.

## Out of Scope

- Wiring `RequirePermission` to `booking`, `payment`, `upload_doc`, or `user_mgmt` routes — those modules are seeded but not guarded in this feature.
- An admin UI or API endpoint for assigning/revoking individual user permissions — permissions are managed directly in the database or via seeding for now.
- Instant permission revocation (token blacklisting, short-lived tokens < 15 min, or server-side session invalidation).
- Per-location permission scoping (e.g., "staff A can only update location 3") — the current model grants module-level permissions, not resource-instance-level.
- Frontend changes to handle `403` responses from the new permission guards.

## Further Notes

- The ADR for this decision is at `docs/adr/0001-jwt-embedded-permissions.md`.
- Domain terminology is defined in `CONTEXT.md` at the repo root. Use **Permission**, **Module**, **Action**, **Role**, **Staff**, **Location** as defined there.
- The existing `PermissionRepository.UserHasPermission` method is preserved — it can be used by future admin tooling without touching the request path.
