# Development Notes

## Initial Review Notes
- Spec is focused on an API contract with a mobile chat application. No mention of features or usage patterns. Any framework may be used to create the backend, but it must interface with a MySQL db.

## Authentication Issues
- **Register**: Password is HRI. Returns an ID, but no session or token.
- **Login**: Same issue as above.

## API Endpoint Issues
- Following endpoints are not structured as resourceful routes, but instead as discrete actions.
- Unclear what the auth mechanism is here. As written, none of these endpoints are secure.

## Specific Endpoint Issues
- **view_messages**: Takes two user ID's. I am assuming this is the mechanism for retrieving a chat history with another user, in which case, it would be insecure to allow the application to search for messages between any two users. It should be using the user context as the basis for one of the users. Risk of too many messages in the response, and no handling of pagination or limits.
- **send_message**: same issue as above. Can send messages as any user.
- **list_all_users**: Unclear of the utility of this, and has potential security and scaling issues (no pagination for lots of users). Normally chat applications have an opt-in type of mechanism for interacting with other users, whether by organization or social relationship.

## General Observations
- Not enough information to make a firm recommendation, but MySQL may not the right db for this. Storing a timeline or a history of a chats is better suited to some kind of nosql db if there is any chance of these histories or the userbase becoming large. Firestore specifically would give us the ability to leverage websockets natively to power real-time features. Elastic for full-text search. Do we need to support archiving, reactions, mentions, replies, audit trails around deletions or editing? These would all dictate different data structures or infra. We could feed this into Kafka and do stream processing for batching.

## Concrete Scenario for Framing the Work
- Based on the issues above, I will imagine a scenario to give some direction to framing the work: we have a very old application which is getting replaced. We don't want to touch the current codebase or infra, and so we must maintain the contract using the given spec. So, our strategy can be to stand up the new version of the application alongside a shim API layer. We can port the DB over using multiple strategies (run two copies in parallel, then cutover, or if the old db is very large and the use case permits, put old chats into an archive, etc). To show feasibility, the deliverable should have two versions of the API in a v1/v2 structure, with shared backing business logic.

## Tasks
- Stand up a simple framework template that comes with the features we need OOB: user/pass auth, token management, MySQL.
- Stand up test framework, get tests in place that model the v1 spec.
- Build the data model for messages, build the API's to get all tests passing.
- Build tests for the v2 of the api to fix the above issues. Build the new functionality (pagination, context checks, resource routes).
- Consider load test to inform alternative data models with tradeoffs? --skipped due to time
- Add any validation needed on inputs (use zod?, probably overkill?), make a decision on adding linting, prettier. ----zod, swagger skipped based on time
- Look for opportunities for code consolidation between the v1/v2 routing.
- Clean up readme, add this log as a separate document, and commit a db dump as requested.

## Database Schema
The database schema can be found in [database/schema.sql](database/schema.sql). This file contains the complete structure of all tables, including indexes and foreign key relationships.

## Time estimate
~4 hours to complete. I chose a framework I've never used before, as I wanted to get some fun experience while completing the task. Additionally, I waffled a bit on how to balance what I perceived to be a specific request with obvious holes in the spec and building something that made sense, hence the v1/v2 scenario.
