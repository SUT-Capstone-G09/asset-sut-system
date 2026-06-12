# Asset SUT System

A university asset booking and management system for Suranaree University of Technology. Users book spaces and equipment; staff manage locations and documents; admins oversee all operations.

## Language

### Access Control

**Permission**:
A `module:action` pair that grants the ability to perform one action within one module (e.g., `location_mgmt:create`, `booking:read`).
_Avoid_: privilege, right, capability

**Module**:
A named domain area that groups related permissions. Current modules: `location_mgmt`, `booking`, `payment`, `upload_doc`, `user_mgmt`.
_Avoid_: resource, service, scope

**Action**:
One of four CRUD operations scoped to a module: `create`, `read`, `update`, `delete`. Sub-resource mutations (e.g., adding equipment or addons to a location) map to `update` on the parent module, not `create`.
_Avoid_: operation, verb, method

**Role**:
A coarse classification of a user that determines which profile type they have and carries a default set of permissions. Values: `admin`, `staff`, `requester`.
_Avoid_: group, user type, account type

### Booking Domain

**Requester**:
A user who submits booking requests for spaces or equipment. May be internal (SUT email) or external.
_Avoid_: customer, client, applicant

**Staff**:
A university employee who manages one or more locations. Can create and update locations they are assigned to.
_Avoid_: manager, operator, employee

**Location**:
A bookable physical space (room, hall, field) with associated equipment, addons, pricing tiers, and availability rules.
_Avoid_: space, venue, room, asset
