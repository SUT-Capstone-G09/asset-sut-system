# Issue 003 — Seed location_mgmt permissions and wire location routes

## What to build

Add `location_mgmt:create/read/update/delete` to the DB seed and assign all four to the `admin` role. Then add `RequirePermission` calls to location route groups using the agreed action mapping:

- `POST /locations` → `location_mgmt:create`
- `PUT /locations/:id` → `location_mgmt:update`
- `DELETE /locations/:id` → `location_mgmt:delete`
- `GET /locations/:id/unavailabilities` → `location_mgmt:read`
- `GET /locations/:id/staff` → `location_mgmt:read`
- All sub-resource mutations (POST/DELETE on equipments, addons, pricing-tiers, unavailabilities, staff assignments) → `location_mgmt:update`

Public GET routes (`GET /locations`, `GET /locations/:id`, `GET /locations/:id/monthly-availability`) remain open — no permission guard.

## Acceptance criteria

- [ ] Seed contains `location_mgmt:create`, `location_mgmt:read`, `location_mgmt:update`, `location_mgmt:delete`
- [ ] All four are assigned to the `admin` role via seed
- [ ] `POST /locations` requires `location_mgmt:create` — returns `403` without it
- [ ] `PUT /locations/:id` requires `location_mgmt:update` — returns `403` without it
- [ ] `DELETE /locations/:id` requires `location_mgmt:delete` — returns `403` without it
- [ ] `GET /locations/:id/unavailabilities` requires `location_mgmt:read` — returns `403` without it
- [ ] All sub-resource POST/DELETE routes require `location_mgmt:update` — returns `403` without it
- [ ] `GET /locations` and `GET /locations/:id` remain accessible without any permission
- [ ] An admin JWT (seeded with all permissions) can call all location mutation endpoints successfully

## Blocked by

- Issue 001 (permissions must be in JWT before routes can enforce them)
- Issue 002 (RequirePermission middleware must exist before it can be wired to routes)
