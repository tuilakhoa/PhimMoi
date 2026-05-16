# Security Specification - Watch Together Feature

## Data Invariants
1. A Room must have a unique ID, a name, a movie reference, and a host.
2. Only the host can delete a room.
3. Once a room is created, its `hostId` is immutable.
4. Chat messages must be linked to a valid room and have a valid user ID.
5. `currentTime` in a room must be a non-negative number.

## The Dirty Dozen Payloads (Target: DENIED)
1. Creating a room without being signed in.
2. Creating a room with someone else's UID as `hostId`.
3. Updating a room's `hostId` after creation.
4. Deleting a room if you are not the host.
5. Sending a chat message with someone else's UID.
6. Sending a chat message to a room that doesn't exist.
7. Injecting a 1MB string into the `name` field of a room.
8. Updating `currentTime` to a negative value.
9. Modifying someone else's name in the `users` list.
10. Creating a room with a fake `movieId` (verified via exists? maybe not possible as movieId is external string).
11. Reading room chats for a room you haven't joined (if I implementation joins).
12. Listing all rooms (if I want private rooms).

## Test Runner logic (Conceptual)
Verify that all the above cases return `PERMISSION_DENIED`.
