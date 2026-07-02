WEB-BASED VEHICLE AUCTION PLATFORM

K.K.J. Hamid

R222226

Supervisor: Dr. Subodha Hettiarachchi Gunawardena

This dissertation is submitted in partial fulfilment of the requirement of the Degree of Bachelor of Information Technology (External) of the University of Colombo School of Computing.

==================================================
DECLARATION
==================================================

I certify that this dissertation does not incorporate, without acknowledgement, any material previously submitted for a degree or diploma in any University/Institute, and to the best of my knowledge and belief, it does not contain any material previously published or written by another person or myself except where due reference is made in the text.

Signature of Candidate: ……………………….  Date: ……………………….
Name of Candidate: Kavindu Kamil Jehan Hamid

Countersigned by:
Signature of Supervisor: ……………………….  Date: ……………………….
Name of Supervisor: Dr. Subodha Hettiarachchi Gunawardena

==================================================
ABSTRACT
==================================================

Tapro Japan Co. Ltd., a Tokyo-based vehicle exporter, historically managed its weekly vehicle auctions through WhatsApp broadcasts and informal messaging. This process offered no audit trail, no buyer verification, and frequent disputes over who placed the highest bid, creating a scaling bottleneck as the client's international buyer base grew. This project designed and implemented a web-based vehicle auction platform to replace this manual workflow with a structured, transparent, and auditable digital system.

The system was built as a three-tier full-stack application: a React 19 single-page front end, a layered Node.js/Express REST API, and a PostgreSQL relational database. The backend strictly separates routes, controllers, services, and repositories, with all business logic — authentication, role-based access control, bid validation, and auction status transitions — concentrated in the service layer. The database schema evolved through eight incremental migrations, moving from a basic four-table design to a normalized structure supporting auction-scoped bidding, hidden reserve prices, and a three-state buyer verification workflow.

Key functionality delivered includes JWT-based stateless authentication, an admin-only buyer verification workflow, a vehicle catalogue with multi-criteria search and filtering, a time-bound auction module with dual-layer status correction (cron scheduling plus on-read recalculation), minimum-increment bid validation, reserve-price privacy protection for non-admin users, and an admin dashboard for vehicle, auction, and user management with manual or automatic winner selection. Direct-to-Cloudinary image uploads keep the backend stateless with respect to binary data.

The system was verified through unit and integration tests covering authentication, vehicle CRUD, bidding rules, and auction lifecycle transitions, supplemented by manual end-to-end and User Acceptance Testing with the client. Testing surfaced and resolved several non-trivial defects, including an authentication flow that blocked all logins, a role-escalation vulnerability in registration, and an architectural flaw that scoped bids to vehicles rather than auctions. The resulting platform meets its core functional and non-functional requirements and gives the client a scalable, transparent replacement for its manual auction process, with payment integration and shipping logistics identified as natural extensions for future work.

==================================================
ACKNOWLEDGEMENTS
==================================================

I would like to express my sincere gratitude to my supervisor, Dr. Subodha Hettiarachchi Gunawardena, for his guidance, technical feedback, and continued support throughout the duration of this project. I am also grateful to the staff of the Faculty of Engineering, University of Ruhuna, and the University of Colombo School of Computing for the resources and environment that made this work possible. My thanks also go to Tapro Japan Co. Ltd. for their cooperation as the client of this project, for sharing their business process in detail, and for their feedback during user acceptance testing. Finally, I would like to thank my family and friends for their patience and encouragement throughout this project.

==================================================
LIST OF ACRONYMS
==================================================

API – Application Programming Interface
CRUD – Create, Read, Update, Delete
CDN – Content Delivery Network
CRC – Cyclic Redundancy Check (not used; placeholder removed)
ERD – Entity-Relationship Diagram
HTTP – Hypertext Transfer Protocol
JWT – JSON Web Token
ORM – Object-Relational Mapping
RBAC – Role-Based Access Control
REST – Representational State Transfer
SDLC – Software Development Life Cycle
SPA – Single Page Application
SQL – Structured Query Language
UAT – User Acceptance Testing
UI – User Interface
UUID – Universally Unique Identifier

==================================================
CHAPTER 1 — INTRODUCTION
==================================================

1.1 Problem and Background

Tapro Japan Co. Ltd. is a vehicle exporter based in Tokyo, Japan, operating as a small private business with two owners. The company purchases used vehicles at weekly Japanese auto auctions and resells them to international buyers in markets such as Sri Lanka, Kenya, and the Middle East. Prior to this project, the entire sales workflow — listing vehicles, collecting bids, and announcing winners — was conducted manually through WhatsApp broadcast lists and Facebook posts. Vehicle photographs and specifications were distributed informally with no consistent structure, buyers replied to message threads with their bids, and the client manually scanned these replies to determine the highest bidder. Winner selection was communicated privately, which buyers who did not win perceived as opaque and potentially unfair.

This manual process produced several concrete problems: there was no audit trail of bids, so disputes about who bid what and when could not be resolved authoritatively; there was no access control, meaning any user could submit a bid without any verification of identity or seriousness; vehicle information was scattered across different message threads with no central record; there was no historical database of past auctions, vehicles, or buyer activity; and the process did not scale — as the number of vehicles and buyers grew, the owners' ability to track bids manually became an operational bottleneck.

1.2 Motivation

As Tapro Japan's buyer base expanded internationally, the volume of concurrent bidding conversations made manual tracking increasingly error-prone. Missed bids, duplicate entries, and miscommunication about vehicle specifications were becoming more frequent, directly affecting customer trust and satisfaction. There was also no mechanism to restrict bidding to verified, financially committed buyers, which meant the client could not distinguish serious purchasers from casual enquiries, slowing down decision-making and increasing the risk of a "winning" bidder later failing to follow through.

The client's intention to grow the business from a small operation into a larger international export operation required a professional, automated, and scalable platform that could attract and manage a larger pool of buyers without proportionally increasing manual administrative work. From an academic standpoint, the project offered an opportunity to model a genuine small-business process — auction-based commerce with identity verification and time-bound bidding — using a modern full-stack web architecture, and to confront real engineering trade-offs such as data consistency under concurrent bidding, stateless authentication, and reserve-price confidentiality.

1.3 Aim and Objectives

The aim of this project is to design, implement, and deliver a web-based vehicle auction platform that digitises and automates Tapro Japan's auction workflow, replacing informal messaging with a transparent, auditable, and scalable system.

The specific objectives are:

1. To develop a web-based platform that streamlines the client's vehicle auction process and improves transparency for buyers, by replacing ad-hoc messaging with a structured catalogue, auction, and bidding system.
2. To ensure secure and trustworthy participation by implementing proper user registration, admin-driven verification, and controlled, role-based bidding access.
3. To support efficient auction management by providing administrators with tools for handling vehicle listings, auction scheduling, user verification, and winning-bidder selection.
4. To maintain accurate historical records of vehicles, auctions, and bids, and to ensure data integrity, reliability, and secure handling of all stored information.
5. To validate and refine the system through iterative testing and direct stakeholder feedback so the delivered system aligns with the client's actual business needs.

1.4 Scope of the Project

The scope of this project covers the full development lifecycle of a web-based vehicle auction platform intended for use by Tapro Japan Co. Ltd. and its international buyers. The system provides three tiers of access. Unauthenticated guests can browse the public vehicle catalogue and auction listings, search and filter vehicles, and view the complete public bid history for any auction. Registered buyers can additionally place bids, but only once their account has been verified by an administrator; buyers can also view auctions they have won on their profile page. Administrators — created only through a one-time seed script rather than through public registration — have full CRUD control over vehicle listings and auctions, can verify or reject buyer accounts, can monitor bidding activity in real time, and can close auctions and select winning bids either automatically or manually.

The system targets a small-to-medium volume of concurrent users appropriate to Tapro Japan's current and near-term business scale, and is designed to be deployed as a single-server full-stack web application (Node.js/Express backend, PostgreSQL database, statically-served React front end behind Nginx). The environment assumed is a standard web browser on desktop or mobile, with no native mobile application component.

Explicitly out of scope for this project are payment gateway integration, shipping and logistics management, and advanced analytics or business-intelligence reporting beyond basic auction-result summaries. These were identified jointly with the client as valuable but separable concerns that can be added as a second phase once the core auction workflow is in active use, and are revisited in the Future Work section of Chapter 6.

1.5 Outline of the Dissertation

Chapter 2 analyses the existing manual process in detail, reviews comparable systems, and derives the functional and non-functional requirements, including security as a first-class functional requirement, along with the justification for the chosen development methodology and technology stack. Chapter 3 presents the system design, covering the three-tier architecture, the layered backend pattern, the entity-relationship model and its evolution, and the user interface design. Chapter 4 describes the implementation: the development environment, module structure, coding conventions, key algorithms such as auction status correction and reserve-price stripping, and version control practices. Chapter 5 reports on the evaluation of the system, covering unit and integration testing, end-to-end manual testing, and user acceptance testing with the client, including the defects discovered and resolved during this process. Chapter 6 concludes the dissertation with a critical evaluation of the project's outcomes, a personal reflection on the learning experience, and recommendations for future work.

==================================================
CHAPTER 2 — ANALYSIS
==================================================

2.1 Existing System and Problem Description

Before this project, Tapro Japan's auction workflow ran entirely through informal communication channels, summarised in Table 2.1.

Table 2.1: Existing manual auction workflow

| Phase | How it worked (old way) |
|---|---|
| Vehicle Listing | Photos taken manually; specifications recorded on paper or in notes; distributed via WhatsApp broadcast lists and Facebook posts. No consistent structure. |
| Bid Collection | Buyers reply to message threads. The client manually reads all replies and identifies the highest bid. No real-time visibility, no enforcement of minimum increments or time limits. |
| Winner Selection | The client privately messages the winning bidder. The process is opaque to other participants and perceived as potentially unfair. |

Figure 2.1 (described below, to be drawn as a flowchart in the final document) illustrates this process: a vehicle is acquired at a Japanese auction → photographed and described informally → broadcast over WhatsApp/Facebook → buyers reply with bid amounts in unstructured text → the owner manually scans replies over an undefined time window → the owner privately messages the perceived highest bidder → the transaction proceeds offline with no system record. The principal failure points in this flow are: (a) no enforced start/end time for bidding, so the cut-off is informal and disputable; (b) no structured bid amount field, so bids embedded in conversational text can be mis-read or missed; (c) no record of bid history, so a buyer who disputes the result has no evidence to refer to; and (d) no verification gate, so any anonymous contact can submit a bid with no commitment.

This existing process directly produced the problems described in Section 1.1: no audit trail, no access control, scattered vehicle information, no centralised history, and an inherent scalability ceiling tied to how many message threads one person can track manually.

2.2 Review of Similar Systems

To inform the design of the platform, three categories of comparable system were reviewed: general consumer auction marketplaces, vertical vehicle-auction platforms, and verified-buyer marketplaces.

Consumer auction marketplaces (such as eBay-style time-bound auctions) provided the closest conceptual model for the core bidding mechanic: a fixed start and end time, a rising minimum bid, and a publicly visible bid history. This model was adopted directly, including the convention of computing the current highest bid live rather than storing it as a separately maintained field, since the latter risks falling out of sync with the underlying bid records.

Vertical vehicle-export auction platforms used by Japanese used-car exporters typically add vehicle-specific structured fields (chassis number, mileage, auction grade) and a reserve price that is hidden from bidders but used internally to decide whether a sale proceeds. This pattern was adopted for the vehicle and auction entities in this project: a chassis_number field with a uniqueness constraint, and a reserve_price field that is computed against but never exposed in API responses to non-admin users.

Verified-buyer marketplaces, common in B2B and high-value asset trading, gate participation behind an account-verification step rather than allowing fully open bidding. This is structurally different from open consumer auctions and was the most directly relevant precedent for this project, since Tapro Japan explicitly required that only buyers it has vetted may commit to a bid. Table 2.2 summarises the comparison.

Table 2.2: Feature comparison of reviewed system categories

| Feature | Consumer auctions | Vehicle-export platforms | Verified-buyer marketplaces | This project |
|---|---|---|---|---|
| Time-bound bidding | Yes | Yes | Sometimes | Yes |
| Hidden reserve price | Rare | Yes | Sometimes | Yes |
| Mandatory buyer verification | No | Sometimes | Yes | Yes |
| Public bid history | Yes | Sometimes | Rare | Yes |
| Minimum bid increment | Yes | Yes | Sometimes | Yes |

The platform designed for this project therefore combines the open, transparent bid-history convention of consumer auctions with the verified-participation and hidden-reserve conventions of vehicle-export and B2B marketplaces, reflecting Tapro Japan's specific requirement for transparency toward genuine buyers without exposing commercially sensitive reserve information.

2.3 System Requirements Analysis

2.3.1 Functional Requirements

Functional requirements were elicited from direct discussion with the client and from the pain points identified in Section 2.1. They are listed in Table 2.3 with priority and category, consistent with the original project proposal submitted for this project.

Table 2.3: Functional requirements

| ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-01 | User registration with email, password, and contact information | High | Users |
| FR-02 | Admin verification or rejection of registered user accounts | High | Users |
| FR-03 | Secure login with JWT-based authentication | High | Users |
| FR-04 | Role-based access control distinguishing public, verified buyer, and admin | High | Users |
| FR-05 | Admin CRUD operations for vehicle listings, including images and specifications | High | Vehicles |
| FR-06 | Public vehicle browsing with search and filtering by make, model, year, and price | High | Vehicles |
| FR-07 | Creation of auctions with configurable start and end date/time | High | Auctions |
| FR-08 | Automatic auction status transitions (draft → active → ended) | High | Auctions |
| FR-09 | Verified users may place bids on active auctions only | High | Bidding |
| FR-10 | Bid validation enforcing minimum increment and auction timing | High | Bidding |
| FR-11 | Real-time display of the current highest bid | High | Bidding |
| FR-12 | Complete, publicly viewable bid history per auction | High | Bidding |
| FR-13 | Admin dashboard showing pending verifications and active auctions | High | Admin |
| FR-14 | Admin selection of the winning bidder per auction, manually or automatically | High | Admin |
| FR-15 | Hidden reserve price with a visible "reserve met" indicator for buyers | Medium | Bidding |
| FR-16 | Buyer-facing notification of auction wins on the buyer's profile | Medium | Users |

2.3.2 Security as a Functional Requirement

Security was treated as a core functional requirement rather than a non-functional afterthought, since the system's central value proposition is trustworthy, auditable bidding. Four security controls were built directly into the system's functional behaviour. Access control is enforced through JWT-based role checks at the middleware layer (authRequired and requireRole), so every protected endpoint explicitly declares which roles may call it. Admin account creation is excluded entirely from the public API surface — administrators can only be created by a database seed script run by a developer with direct database access, preventing any client-side request from escalating itself to admin. Input validation is enforced through Joi schemas at the route layer for every mutating endpoint, rejecting malformed or unexpected fields before they reach business logic. Data protection is enforced through bcrypt password hashing (cost factor ≥ 10), parameterised SQL queries on every repository call to prevent injection, and reserve-price values being stripped from API responses at the service layer before they ever reach a non-admin client, rather than being hidden only in the front end. Treating these as functional requirements meant each had an explicit, testable behaviour rather than being an implicit assumption.

2.3.3 Non-Functional Requirements

Table 2.4: Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | API responses should complete in under 500 ms under normal load; the system should support at least 100 concurrent users. |
| Reliability | The system should maintain 99% uptime during active auction periods; database transactions must guarantee consistency for concurrent bid submissions. |
| Usability | The interface must be responsive across desktop and mobile screen sizes; returning buyers should require no training to use core features. |
| Scalability | The backend must be stateless (no server-side session store) so it can be deployed behind a load balancer if buyer volume grows; the database must use connection pooling. |
| Maintainability | The backend must enforce strict separation between routes, controllers, services, and repositories so that a change to one concern (e.g., a new database column) does not require changes to unrelated layers. |
| Security | See Section 2.3.2. |

2.4 Justification of Development Approach and Technologies

2.4.1 Chosen SDLC Model and Rationale

An Agile-inspired iterative model was adopted, structured as four sprints, each delivering a complete vertical slice of functionality spanning database, backend, and frontend rather than completing one tier in isolation. This was chosen over a Waterfall model for three reasons specific to this project. First, the bidding module carried the highest technical risk in the system — concurrent bid validation, auction status correctness, and reserve-price privacy — and an iterative approach allowed this risk to be confronted and tested early (Sprint 3) rather than discovered late. Second, because the system replaces a live business process for a real client, early and incremental UI feedback from Tapro Japan was more valuable than a single end-of-project review. Third, a vertical-slice approach meant that after each sprint there was a genuinely testable, demonstrable increment (for example, working registration and login after Sprint 1), which reduced integration risk compared to building all of the backend before any of the frontend. Table 2.5 summarises the four sprints.

Table 2.5: Sprint breakdown

| Sprint | Deliverable |
|---|---|
| Sprint 1 | End-to-end user registration and login: database schema, authentication API, login UI |
| Sprint 2 | Vehicle listings: CRUD API endpoints, catalogue grid UI, detail page, search and filtering |
| Sprint 3 | Bidding module: auction management, bid placement, validation, countdown timers |
| Sprint 4 | Admin dashboard, winner selection, UI polish, user acceptance testing |

2.4.2 Technology Stack Justification

Table 2.6: Technology stack and justification

| Layer | Technology | Justification |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 | A component-based SPA model suits a UI with many dynamic, frequently-updating regions (live bid amounts, countdown timers, status badges). Vite was chosen for its fast hot-module-reload during development. React was preferred over Vue for its larger ecosystem and longer-term maintainability for a single-developer project. |
| Backend | Node.js 20 + Express 4 | Non-blocking I/O is well suited to handling many concurrent bid submissions without thread-per-request overhead. Using JavaScript across both frontend and backend reduced context-switching for a solo developer. Express's minimalism allowed the strict custom layered architecture (Section 3.2) to be enforced explicitly rather than fighting a more opinionated framework. Django/Python was considered and rejected due to added deployment complexity without a corresponding benefit for this project's scale. |
| Database | PostgreSQL 16 | ACID-compliant transactions are essential to guarantee bid integrity under concurrent submissions. PostgreSQL's native array type (TEXT[]) was used directly for vehicle image URLs, avoiding a separate join table. Its NUMERIC type guarantees exact decimal arithmetic for currency, and its UNIQUE constraint semantics (treating each NULL as distinct) suited the optional chassis_number field. MySQL was considered and rejected due to weaker SERIALIZABLE isolation guarantees and the absence of a native array type. |
| Authentication | JWT (jsonwebtoken) | A stateless token-based scheme avoids a server-side session store, simplifying horizontal scalability, and allows role and verification claims to travel with the request without an extra database lookup on every call. |
| Image storage | Cloudinary (free tier) | Unsigned browser-to-CDN upload keeps the backend stateless with respect to binary data and avoids the performance and backup complications of storing images in PostgreSQL or on the application server's local disk. |
| Validation | Joi | Declarative schema validation with built-in support for stripping unknown fields and collecting all validation errors in a single response, rather than failing on the first error. |
| Scheduling | node-cron | A lightweight in-process scheduler was sufficient at this project's scale; an external job queue was judged to be unnecessary complexity. |

==================================================
CHAPTER 3 — DESIGN
==================================================

3.1 Introduction to System Design

This chapter translates the requirements defined in Chapter 2 into a concrete architectural and data design. The guiding design principle throughout is separation of concerns: each layer of the backend, and each major frontend module, has exactly one responsibility, which directly supports the maintainability and testability non-functional requirements (Table 2.4).

3.2 System Architecture Overview

The system follows a three-tier architecture, illustrated conceptually in the project proposal's system diagram and detailed in Table 3.1.

Table 3.1: Three-tier architecture responsibilities

| Tier | Technology | Responsibility |
|---|---|---|
| Presentation | React 19 + Vite + Tailwind CSS v4 | Renders the UI, manages local component state, and communicates with the backend exclusively over HTTP via a single Axios instance. Contains no business logic. |
| Application | Node.js + Express | Exposes a REST API; enforces authentication, authorisation, and all business rules. |
| Data | PostgreSQL | Relational storage with ACID transactions for bid integrity, accessed through a pooled connection (pg.Pool). |

Within the application tier, the backend follows a strict four-layer pattern, shown as a request trace in Figure 3.1 (described below):

Request → Route → Controller → Service → Repository → Database, with cross-cutting Middleware (authentication, validation, error handling) intercepting the request before it reaches the controller.

Table 3.2 defines the responsibility of each layer precisely, since this separation is the central architectural decision of the backend.

Table 3.2: Backend layer responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Routes | src/routes/ | URL patterns and middleware chains only. Zero business logic. |
| Controllers | src/controllers/ | Thin glue: call exactly one service method, then send the response or forward the error via next(err). |
| Services | src/services/ | All business logic, authorisation decisions, and cross-entity rules. |
| Repositories | src/repositories/ | SQL queries only, using parameterised statements. No business logic. |
| Middleware | src/middleware/ | JWT verification, role enforcement, Joi validation, and global error handling. |

This separation was chosen, rather than a more conventional MVC structure with logic embedded in controllers, for three reasons. First, testability: services can be unit-tested without spinning up the HTTP layer, and repositories can be mocked independently. Second, security: because all authorisation logic lives in the service layer rather than the controller, it is enforced consistently even if a service method is called from a different entry point (for example, from an automated test or, in future, from a background job), rather than relying on every controller to remember to re-check permissions. Third, change isolation: a schema change such as adding a new vehicle column requires editing only the corresponding repository function; no other layer needs to know about column names.

3.3 Component and Module Design

3.3.1 Backend Modules

The backend is organised into one repository, one service, one controller, and one route file per primary resource: users, vehicles, auctions, and bids. Each repository exposes narrow, single-purpose functions (for example, findByEmail, findById, create, findAll, setStatus for the user repository). The auction repository's findAll and findById queries join the vehicles table to surface denormalised display fields (vehicle_make, vehicle_model, vehicle_year, vehicle_images) and use a correlated subquery, `(SELECT MAX(amount) FROM bids WHERE auction_id = a.id) AS highest_bid`, to compute the current highest bid live rather than maintaining a separately stored column that could fall out of sync with the bids table. The vehicle repository's findAll function supports dynamic filtering across up to nine optional conditions (status, make, model, year range, price range, free-text search), building a parameterised WHERE clause and running the query twice — once with COUNT(*) for pagination metadata and once with LIMIT/OFFSET for the page of results.

3.3.2 Frontend Modules

The frontend follows a similar single-responsibility convention. One Axios instance (src/api/client.js) carries a request interceptor that attaches the JWT Bearer token from localStorage to every outgoing request; one thin wrapper file per resource (auth.js, users.js, vehicles.js, auctions.js, bids.js, cloudinary.js) exposes typed functions over that instance, so no component is permitted to call Axios directly. Pages own their own data-fetching and loading/error state using useState and useEffect. Cross-cutting concerns that do not fit a parent/child component relationship — specifically, notifying the Navbar's pending-user-count badge when AdminPage approves or rejects a buyer — are handled with a custom DOM event (`window.dispatchEvent(new CustomEvent('user-status-changed'))`) rather than prop drilling or a global state library, which was judged proportionate given the small number of cross-component signals required.

3.4 Workflow and Behavioural Modelling

3.4.1 End-to-End Sale Workflow

Figure 3.2 (to be drawn as a sequence/activity diagram in the final document) models the complete lifecycle of a sale, summarised in Table 3.3.

Table 3.3: End-to-end sale workflow

| Step | Actor | Action |
|---|---|---|
| 1 | Admin | Creates a vehicle record (status: listed) with images and specifications |
| 2 | Admin | Creates an auction linked to the vehicle, setting start/end times, reserve price, and minimum increment |
| 3 | System | Cron job runs every minute; if starts_at has passed and status is draft, sets status to active |
| 4 | Buyer | Self-registers; admin verifies the account before the buyer can bid |
| 5 | Buyer | Places bids on the active auction; each bid must exceed the current highest bid by at least the minimum increment |
| 6 | System / Admin | Cron job sets status to ended once ends_at has passed, or admin manually closes the auction (auto-assigning the highest bid as winner) |
| 7 | Admin | Reviews the bid ladder and confirms or manually overrides the winning bid |
| 8 | System | The winner page becomes publicly viewable, showing the winning buyer's name and bid amount |
| 9 | Buyer | Sees a "You Won!" banner on next login and the auction appears in their profile |

3.4.2 Auction Status Transition Logic

Auction status is modelled as a three-state machine (draft → active → ended) driven by two independent mechanisms working together, since relying on either alone was found insufficient (see Bug #7 in Chapter 5). A cron job (node-cron, running every minute) executes two bulk UPDATE statements against the whole auctions table, transitioning draft auctions whose starts_at has passed to active, and active auctions whose ends_at has passed to ended. Independently, a pure function, effectiveStatus(auction), is evaluated on every read of an auction and recomputes the status from the stored timestamps; if it disagrees with the persisted status, the service immediately writes the corrected value back to the database. This guarantees that the status displayed to any client is always accurate at the moment of the request, while the cron job ensures the database itself self-corrects even when no request is being made.

3.5 Data Modelling

3.5.1 Entity-Relationship Overview

The final data model comprises four entities — users, vehicles, auctions, and bids — connected as follows: a user (admin) owns many vehicles (seller_id foreign key); a vehicle has at most one current auction (vehicle_id foreign key from auctions to vehicles, with ON DELETE CASCADE); an auction has many bids (auction_id foreign key from bids to auctions, with ON DELETE CASCADE); a bid belongs to exactly one user (user_id foreign key); and an auction optionally references one bid as its winner (winning_bid_id foreign key on auctions, nullable until a winner is selected).

3.5.2 Schema Evolution

The schema was not designed in a single pass; it evolved through eight incremental, numbered migrations, each solving a specific problem identified during analysis or development, summarised in Table 3.4. This incremental approach follows the standard professional practice of never editing a migration after it has been applied to a real database — every change is captured as a new file, preserving a complete, reproducible history of how the schema reached its final state.

Table 3.4: Migration history

| Migration | Change | Rationale |
|---|---|---|
| 001 | Initial schema: users, vehicles, auctions, bids | Establishes the four core entities with status CHECK constraints enforced at the database level |
| 002 | Drop vehicle_id from bids; add auction_id | Bids belong to a specific auction event, not permanently to a vehicle (see Bug #5, Chapter 5) |
| 003 | Add winning_bid_id foreign key to auctions | Records the admin's winner selection |
| 004 | Add chassis_number, mileage, grade, images[] to vehicles | Captures vehicle-specific specification fields required by FR-05 |
| 005 | Replace boolean is_verified with verification_status enum | A boolean cannot represent the required "pending" state (see Section 3.5.3) |
| 006 | Add min_increment to auctions | Enforces FR-10's minimum bid raise |
| 007 | Add nullable reserve_price to auctions | Supports the hidden reserve-price requirement (FR-15) |
| 008 | Add UNIQUE constraint on chassis_number | Prevents duplicate vehicle registrations while still permitting multiple NULLs |

3.5.3 Key Data Modelling Decisions

NUMERIC over FLOAT for currency. All monetary fields (starting_price, amount, min_increment, reserve_price) use NUMERIC(12,2) rather than a floating-point type. Floating-point binary representation cannot exactly represent all decimal fractions, which is unacceptable for financial values where every cent matters; NUMERIC stores an exact decimal value.

Computed highest_bid rather than a stored column. An earlier design considered storing current_highest_bid as a column on the auction, updated whenever a bid was inserted. This was rejected because it introduces a denormalisation risk: if the bid insert succeeds but a subsequent update to the cached column fails (or is skipped due to a bug), the displayed highest bid silently diverges from the true value in the bids table. Computing it live via a correlated subquery removes this entire class of bug at a modest, acceptable query cost.

Enumerated verification_status over a boolean. The original design used a boolean is_verified flag. This could not represent the required three-state workflow (pending, verified, rejected) — specifically, it could not distinguish a buyer who has registered but not yet been reviewed from one who has been explicitly rejected. Migration 005 replaced the boolean with a VARCHAR column constrained by a CHECK clause to these three values.

Inline CHECK constraints over lookup tables. An earlier ERD modelled role and auction/verification status as separate lookup tables with their own primary keys, following conventional normalisation practice. This was deliberately simplified to inline CHECK constraints, because these are small, fixed sets of values that will never be added to or removed from at runtime; a lookup table would only add unnecessary JOIN overhead to the authentication path and every auction status query, with no corresponding gain in data integrity.

Eliminating the seller role. The original requirements analysis considered a distinct "seller" role separate from "admin". This was removed during analysis because, in Tapro Japan's actual business model, the owner is always the seller — it is a one-to-many relationship between one business and many buyers, not a marketplace with multiple independent sellers. Retaining a separate seller role would have added permission-checking complexity with no corresponding business value. The seller_id column was kept on the vehicles table (it always refers to the admin who created the listing, useful for audit purposes) but the role itself was removed from registration, route guards, and service logic.

3.6 User Interface Design

The interface was designed around three guiding principles: transparency (any visitor, logged in or not, can see the full public bid history and current highest bid for any auction), minimal friction for returning buyers (no training should be required — status is communicated through colour-coded badges and plain-language banners rather than jargon), and responsiveness across desktop and mobile, implemented with Tailwind CSS v4's utility classes rather than custom per-component CSS.

Key screens designed include: a public vehicle catalogue page with URL-synchronised filters (so that filtering, pagination, and even back/forward browser navigation all preserve and restore the correct query state) and skeleton-loading placeholders while data is in flight; an auction detail page — the most visually complex screen — combining a lightbox image gallery, a live countdown timer, a colour-coded reserve-price indicator (no reserve / not met / met, with the actual amount visible only to admins), a bid submission form shown only to verified, authenticated, non-admin users while the auction is active, and (for admins) a "Close Auction" control and a bid ladder for manual winner selection; and an admin dashboard organised into three tabs (Vehicles, Auctions, Users), with the Users tab providing per-user verify/reject actions that immediately update a pending-count badge in the navigation bar via the custom event mechanism described in Section 3.3.2.

==================================================
CHAPTER 4 — IMPLEMENTATION
==================================================

4.1 Development and Deployment Environment

Development was carried out on Node.js 20 LTS and PostgreSQL 16, using Visual Studio Code with the ESLint, Prettier, and PostgreSQL extensions. Git was used for version control from the start of the project. The backend uses ECMAScript Modules throughout (`"type": "module"` in package.json), requiring all imports to use `import`/`export` syntax with explicit `.js` extensions rather than CommonJS `require()`. Backend dependencies installed via npm include express, pg, bcrypt, jsonwebtoken, joi, morgan, node-cron, and dotenv, with nodemon as a development-only dependency for automatic server restarts. The frontend was scaffolded with Vite's React template and uses react-router-dom and axios as runtime dependencies, with tailwindcss, @tailwindcss/vite, and @tailwindcss/forms as development dependencies. Environment-specific configuration (database connection string, JWT secret, Cloudinary credentials) is kept out of version control via .env files, with backend secrets never committed and frontend Cloudinary configuration (necessarily public, since it is compiled into the client bundle) kept in a separate, explicitly public-facing .env.

For deployment, the target environment is a single Ubuntu 22.04 server running PostgreSQL, Nginx as a reverse proxy and static file server, and PM2 as the Node.js process manager, configured to restart the API automatically on crash or server reboot. Nginx is configured to proxy `/api/` requests to the Node.js backend on port 3000 while serving the built React application's static files for all other routes, with a `try_files $uri $uri/ /index.html;` fallback rule — without this rule, a browser refresh on a client-side route such as `/auctions/5` would return a 404 from Nginx instead of letting React Router handle it.

4.2 Development Practices and Coding Standards

The codebase is organised by the four-layer pattern described in Section 3.2, with one file per resource per layer. Naming follows a consistent convention: repositories, services, and controllers are named `<resource>Repository.js`, `<resource>Service.js`, and `<resource>Controller.js` respectively, and route files are named after their resource in the plural (`vehicles.js`, `auctions.js`). Environment variables are read in exactly one place, `src/config/index.js`, which all other modules import rather than calling `process.env` directly; this centralisation made it straightforward to confirm during code review that no secret or configuration value was being read inconsistently elsewhere. `app.js` (which constructs the Express application and mounts middleware and routes) and `server.js` (which starts the HTTP listener and the cron scheduler) are kept as separate files specifically so that automated tests can import `app.js` directly without triggering the live HTTP server or the cron scheduler.

Errors follow a single convention throughout the service layer: a service that detects a business-rule violation throws a plain `Error` object with an attached `.status` property (for example, `err.status = 404`), and a single global error-handling middleware reads this property to set the HTTP response code, so the meaning of every error is decided once, in the layer that detected it, rather than being re-interpreted by each controller.

4.3 Critical Code Segments

4.3.1 Authentication Middleware

Two exported middleware functions guard protected routes. `authRequired` reads the `Authorization: Bearer <token>` header, calls `jwt.verify()`, and on success sets `req.user` to the decoded payload (containing `sub` — the user's database ID — `role`, `email`, and `isVerified`); on failure it returns 401. `requireRole(roles)`, which must run after `authRequired`, checks that `req.user.role` is included in the allowed roles array and returns 403 otherwise. This pair of middleware functions is composed declaratively in each route file, for example `router.post('/', authRequired, requireRole(['admin']), validate(vehicleSchema), createVehicleController)`, making the access rule for an endpoint readable directly from its route definition.

4.3.2 Auction Status Correction

The `effectiveStatus()` function in `auctionService.js` is the core algorithm underpinning the dual-layer status-transition design described in Section 3.4.2:

```
export function effectiveStatus(auction) {
  const now = new Date();
  if (auction.status === 'draft' && auction.starts_at && new Date(auction.starts_at) <= now)
    return 'active';
  if (auction.status === 'active' && auction.ends_at && new Date(auction.ends_at) <= now)
    return 'ended';
  return auction.status;
}
```

This is a pure function with no side effects, which made it straightforward to unit-test in isolation against a range of timestamp combinations. The calling service code compares this computed value against the persisted `status` column and issues a write-back update only when they differ, minimising unnecessary database writes.

4.3.3 Reserve Price Privacy

Reserve-price confidentiality (FR-15) is enforced once, at the service layer, rather than being left to the frontend to hide:

```
function stripReserve(auction, user) {
  const reserveMet = auction.reserve_price == null ? null
    : (auction.highest_bid != null
        ? Number(auction.highest_bid) >= Number(auction.reserve_price)
        : false);
  if (user?.role === 'admin') return { ...auction, reserve_met: reserveMet };
  const { reserve_price, ...rest } = auction;
  return { ...rest, reserve_met: reserveMet };
}
```

Admins receive the full object including the actual reserve amount; every other caller receives the same object with `reserve_price` destructured out, but still receives a `reserve_met` boolean (or `null` if there is no reserve) so that buyers can see a meaningful coloured indicator in the UI without the underlying amount ever leaving the server.

4.3.4 Bid Placement Validation

`bidService.placeBid()` performs an ordered sequence of checks, each throwing a descriptive error with an appropriate `.status` on failure: the user must be verified (read from the JWT payload, avoiding a database round-trip); the referenced auction must exist; `effectiveStatus(auction)` must evaluate to `'active'` (with the draft and ended cases distinguished so the error message correctly tells the buyer whether the auction has not yet started or has already finished); and the submitted amount must be at least the current highest bid plus `min_increment` (or simply greater than the current highest bid if `min_increment` is zero). This ordering — verification, then existence, then timing, then amount — was chosen so that the most common and most informative failure (an unverified buyer trying to bid) is reported before the system spends effort validating the bid amount itself.

4.3.5 Partial Update Merging

`vehicleService.updateVehicle()` (and the equivalent auction update logic) fetches the existing database row first and merges it with the incoming payload using the nullish-coalescing operator, rather than passing the raw request body directly to an UPDATE statement:

```
const merged = {
  title: payload.title ?? existing.title,
  make: payload.make ?? existing.make,
  // ...remaining fields follow the same pattern
};
```

This pattern — using the payload's value only if it was actually provided, and falling back to the existing value otherwise — is the standard approach for supporting partial updates over an HTTP PUT/PATCH endpoint, and was introduced specifically to fix a defect described in Chapter 5 (Bug #6) where omitted fields were being silently overwritten with NULL.

4.4 Version Control Practices

Git was used from project inception, with the repository structured around two top-level directories, `Backend/` and `Frontend/`, each with its own `package.json` and `node_modules`. A root-level `.gitignore` excludes `node_modules/`, `.env`, build output (`dist/`), and OS artefacts. Commits were made at a meaningful, reviewable granularity (for example, one commit per migration file, one commit per resource's repository/service/controller/route set), with descriptive messages identifying the resource and change being made. Database migration files were never amended in an existing commit once applied to any running database instance — schema changes were always captured as new, additively-numbered migration files, consistent with the design decision in Section 3.5.2.

4.5 Testing Tooling Notes

Two environment-specific issues were resolved during implementation and are recorded here as they affect reproducibility. On Windows, running the test script via `node_modules/.bin/jest` failed with a syntax error because `.bin/jest` is a POSIX shell script; this was fixed by invoking `node_modules/jest/bin/jest.js` directly through `node`, which is the actual Node.js-executable entry point and is platform-independent. Separately, because the backend uses ECMAScript Modules (`"type": "module"`), Jest's default CommonJS-based module loading is incompatible; this was resolved by running Jest with Node's `--experimental-vm-modules` flag, giving a final test script of `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --forceExit`.

==================================================
CHAPTER 5 — EVALUATION
==================================================

5.1 Testing Strategy Overview

The system was verified at four levels: unit testing of pure business-logic functions, integration testing of complete API request/response cycles, manual system testing via a structured end-to-end checklist, and User Acceptance Testing with the client. A dedicated test database (`vehicle_auction_test`), schema-identical to the development database but populated independently, was used for all automated tests, with its own `.env.test` configuration, so that test runs could never affect or be affected by development data.

5.2 Unit and Integration Testing

Automated tests were written using Jest, organised one test file per resource, as summarised in Table 5.1.

Table 5.1: Automated test coverage by file

| Test file | Coverage |
|---|---|
| auth.test.js | Buyer registration, rejection of attempted admin self-registration, duplicate-email handling, password validation, login and token issuance, and 401 responses for missing/invalid credentials |
| vehicles.test.js | Public listing, and create/update/delete operations verified against 401/403/200/204 outcomes per role, plus the filtering and pagination query suite |
| users.test.js | Verify/reject workflow, the corresponding 401/403/404/409 error cases, confirmation that a freshly issued token correctly reflects `isVerified: true` after verification, and the `/users/me` endpoint |
| bids.test.js | Rejection of bids from unverified buyers, successful bids from verified buyers, the outbid/minimum-increment enforcement rule, and rejection of bids placed by an admin account |
| auctions.test.js | Auction CRUD, the close-auction action, manual winner selection, the public winner endpoint, and the automatic status-transition logic |

Because services were designed to be callable independently of the HTTP layer (Section 3.2), pure functions such as `effectiveStatus()` could be tested directly against a range of timestamp inputs without needing to mock an HTTP request at all, which kept these particular tests fast and deterministic.

5.3 System and End-to-End Testing

Backend endpoints were additionally exercised manually with `curl` against a running development server, covering registration, login, admin user-verification, vehicle and auction creation, and bid placement, to confirm behaviour matched the automated test expectations under a real running process rather than only inside the test harness.

A structured frontend smoke-test checklist was run through after each significant feature was completed, covering the full lifecycle in sequence: registering a new buyer and confirming the redirect to login with a success message; logging in as admin and confirming redirection to the admin dashboard; creating a vehicle with at least two Cloudinary-hosted images; creating an active auction with a reserve price against that vehicle; confirming the bid form is hidden for an unverified buyer; verifying the buyer as admin and confirming the navbar's pending-count badge decrements immediately via the custom event mechanism; confirming the bid form becomes visible only after the buyer re-logs-in (refreshing their JWT); placing a bid and confirming it appears in the public bid list with the reserve indicator updating accordingly; closing the auction as admin and confirming the highest bid is automatically selected as winner; confirming the public winner page is reachable and correct; logging in as the winning buyer and confirming the "You Won!" banner appears; confirming the won auction appears on the profile page with the correct winning amount; and confirming that dismissing the win banner persists across a subsequent page load (via the `wonDismissed` key in localStorage).

5.4 Defects Identified and Resolved

Systematic review of the implementation against the requirements in Chapter 2 surfaced twelve significant defects during development, several of which were architecturally important rather than cosmetic. These are recorded here because they represent the most substantive technical learning from the implementation phase.

The most severe defect found was a complete absence of any database schema — the migrations directory was initially empty while the rest of the application assumed the four core tables already existed, causing the server to crash on the very first API call. This was resolved by writing `001_initial_schema.sql`, with all subsequent schema changes made only through additively numbered migration files thereafter.

A second blocking defect was discovered in the authentication flow: `authService.login()` contained a hard 403 rejection for any user whose `is_verified` flag was false, but no endpoint existed anywhere in the system to ever set that flag to true, meaning every user who registered was permanently locked out of logging in at all. The intended behaviour — that unverified users can log in but cannot bid — had been implemented as a complete login block instead. This was fixed by removing the 403 check from login entirely, embedding the verification status in the JWT issued at login time, moving the verification check specifically into `bidService.placeBid()` where it belonged, and adding the missing admin-only `PATCH /api/users/:id/status` endpoint.

A security-significant defect allowed any unauthenticated client to self-register as an administrator, because the registration endpoint's Joi schema accepted `role: 'admin'` as a valid value submitted directly in the request body. This was closed with a two-layer fix: the route-level schema was restricted to accept only `'buyer'`, and a second, independent guard was added inside `authService.register()` checking submitted roles against an explicit allow-list, so the rule holds even if route-level validation were ever bypassed or refactored incorrectly. This reflects the general security principle, applied consistently throughout the system, that a privileged role is a trust boundary decided by the server, never a value the client is trusted to supply.

A logic gap meant bids were being accepted against auctions in any state — including auctions that had not yet started, had already ended, or did not exist at all — because `bidService.placeBid()` contained only a TODO comment where the auction-state check should have been. This was fixed by having `placeBid()` fetch the auction and evaluate `effectiveStatus()` before accepting any bid amount, with distinct error messages for the not-yet-started and already-ended cases.

An architectural defect, more serious than a simple bug, was that the original bids table scoped bids to a vehicle (`vehicle_id`) rather than to a specific auction event (`auction_id`). Because a single vehicle could in principle be re-auctioned, this meant a query for the "current highest bid" on a vehicle could incorrectly return a bid left over from a previous, unrelated auction of that same vehicle. This was corrected via migration 002, which dropped `vehicle_id` from the bids table entirely and introduced `auction_id` as the sole scoping foreign key, with supporting indexes added for the now auction-scoped highest-bid query.

A further logic defect caused partial vehicle updates to silently destroy data: `vehicleService.updateVehicle()` originally passed the raw request body straight through to an UPDATE statement that set every column, so a client sending only `{ title: "New Title" }` would have every other field — make, model, description, images — overwritten to NULL. This was fixed with the existing-record merge pattern described in Section 4.3.5.

Auction status was found to never change automatically at all — the `starts_at`/`ends_at` timestamps and `status` column existed, but nothing in the system actually transitioned status based on the current time, so an auction could remain "draft" indefinitely even after its scheduled start had passed. This led to the dual-layer fix (cron scheduler plus on-read correction) described in Section 3.4.2 and Section 4.3.2.

No mechanism existed at all to record which bid had won an auction — there was no `winning_bid_id` column and no service method to select one — meaning the central business requirement of the entire project, selecting and announcing a winner, was simply unimplemented. This was resolved with migration 003 and the addition of `closeAuction()` (automatic highest-bid selection) and `selectWinner()` (manual admin override) service methods, together with a public `GET /api/auctions/:id/winner` endpoint.

There was no endpoint to retrieve a user's current, live profile data — only the (potentially stale) claims embedded in their JWT — which was insufficient for the profile page's verification-status display. `GET /api/users/me` was added to close this gap.

The auction routes had no Joi input validation at all on create or update, in contrast to the vehicle routes, meaning arbitrary request bodies reached the service layer unchecked; explicit `auctionCreateSchema` and `auctionUpdateSchema` schemas were added to close this gap.

A subtler defect was found through the automated test suite itself rather than manual inspection: `authService.register()`'s response constructed `isVerified: user.isVerified`, but the underlying database row used the snake_case column name `is_verified`, so every registration response silently returned `isVerified: undefined`. This was caught by an explicit test assertion (`expect(res.body.isVerified).toBe(false)`) and is recorded here specifically as evidence of the practical value of automated testing beyond manual smoke-testing.

Finally, the bid-history endpoint (`GET /api/auctions/:id/bids`) had been placed behind `authRequired`, which silently locked out guests and any logged-out visitor from seeing bid history at all — directly contradicting the transparency requirement (FR-12) that bid history be public. This was fixed by removing the authentication requirement from that specific route and confirming the frontend fetches bid history unconditionally rather than only when a user is logged in.

5.5 User Acceptance Testing

Following the resolution of the defects above, a User Acceptance Testing session was conducted with the client. The two business owners at Tapro Japan Co. Ltd. were given guided access to a deployed instance of the system and asked to perform representative tasks corresponding to their actual weekly workflow: listing a newly acquired vehicle with photographs and specifications, scheduling an auction for it, reviewing the live bid ladder for an active auction, verifying a newly registered buyer, and closing an auction to select a winner. Feedback was gathered through direct observation and follow-up discussion rather than a formal written survey, given the small number of stakeholders involved.

The client's feedback was broadly positive regarding the core workflow, in particular the transparency of the public bid history (directly addressing the dispute concerns described in Section 1.1) and the convenience of the admin dashboard's pending-verification badge for tracking new buyer registrations without needing to navigate away from whatever page they were on. The principal piece of feedback that led to a design adjustment concerned the reserve-price indicator: the client initially expected to be able to see, as admin, the reserve status at a glance across the auction list rather than only on the detail page, which informed minor UI refinement to surface the `reserve_met` indicator in the admin auction table view rather than requiring a click into each auction individually. No correctness defects were identified during UAT itself — the issues found at this stage were entirely usability-oriented, which is consistent with the more substantial, architecture-level defects already having been found and resolved during the unit/integration testing phase described in Section 5.4.

==================================================
CHAPTER 6 — CONCLUSION
==================================================

6.1 Critical Evaluation

The delivered system meets its core functional requirements: secure registration and authentication, admin-controlled buyer verification, full vehicle CRUD with search and filtering, time-bound auctions with automatically and reliably correct status, minimum-increment bid validation, public bid transparency, hidden reserve pricing with a buyer-visible indicator, and both automatic and manual winner selection. The non-functional requirements around security (parameterised queries, bcrypt hashing, role-based access control enforced server-side) and maintainability (the strict layered backend architecture) were also achieved and were directly responsible for making the defects described in Chapter 5 findable and fixable in isolation — for example, the bid-scoping defect (Bug #5) required changes only to the bids repository and a migration, not to any controller or route.

Some trade-offs were made deliberately. The JWT-based authentication scheme accepts a known staleness window: a buyer's verification status embedded in their token does not update until they log in again, even if an admin verifies them in the interim. This was judged an acceptable cost for the simplicity and statelessness gained by avoiding a server-side session store, and is mitigated by having the profile page always read live data from `/api/users/me` rather than trusting the token. Similarly, the dual-layer auction status correction (cron plus on-read) accepts up to a one-minute window where the database's stored status could theoretically lag reality if no request happens to arrive in that window; in practice, the on-read correction means no client-visible response is ever stale, only the raw database row briefly is.

The system's main current limitation, by deliberate scope decision rather than oversight, is the absence of payment and shipping-logistics integration, meaning the platform manages the auction and winner-selection process but the actual transaction and delivery still proceed offline, as documented in Section 1.4.

6.2 Personal Reflection

This project required applying software development principles across the full stack rather than in isolation, and the most valuable learning came specifically from the defect-discovery process documented in Chapter 5. Several of the defects found — particularly the bid-scoping architectural flaw and the login-blocking authentication bug — were not surface-level mistakes but consequences of an initial design that had not been thought through against the actual business requirement closely enough; finding and correctly diagnosing them required systematically tracing requirements through to implementation rather than only testing happy-path behaviour. Working independently, without a team to catch design flaws through review, reinforced the value of writing the layered architecture early, since it made these defects locatable and fixable in single, contained files rather than requiring wide, risky refactors. The experience also developed practical skills in incremental database schema management through migrations, in writing tests that catch real defects (Bug #11 was found by a test assertion, not by manual inspection), and in communicating technical trade-offs (such as the JWT staleness window) to a non-technical client in a way that let them make an informed decision rather than treating it as a hidden flaw.

6.3 Future Work

Several extensions were identified jointly with the client as valuable next steps beyond the current scope. Payment integration, allowing a winning buyer to place a deposit or full payment directly through the platform, was the most frequently requested addition during client discussions, though it was correctly excluded from this project's scope given the additional compliance and security surface area it would introduce. Shipping and logistics tracking, allowing the client to record and the buyer to view the export and delivery status of a won vehicle, would extend the system's usefulness beyond the point of sale. Real-time bid updates via WebSockets (Socket.io) could replace the current 15-second polling interval on the auction detail page, reducing latency between a bid being placed and other viewers seeing it, at the cost of additional infrastructure complexity that was judged unnecessary at the project's current scale. Finally, basic analytics — auction-level summaries of bid counts, participation rates, and price trends over time — would help the client identify which categories of vehicle attract the strongest buyer interest, supporting better purchasing decisions at the Japanese auctions that supply the platform.

==================================================
REFERENCES
==================================================

[1] Express.js, "Express - Node.js web application framework," [Online]. Available: https://expressjs.com/. [Accessed: 2026].
[2] PostgreSQL Global Development Group, "PostgreSQL Documentation," [Online]. Available: https://www.postgresql.org/docs/. [Accessed: 2026].
[3] React, "React Documentation," [Online]. Available: https://react.dev/. [Accessed: 2026].
[4] Vite, "Vite Documentation," [Online]. Available: https://vitejs.dev/. [Accessed: 2026].
[5] Tailwind Labs, "Tailwind CSS v4 Documentation," [Online]. Available: https://tailwindcss.com/docs. [Accessed: 2026].
[6] Auth0, "JSON Web Tokens Introduction," [Online]. Available: https://jwt.io/introduction. [Accessed: 2026].
[7] Joi, "Joi Schema Validation Documentation," [Online]. Available: https://joi.dev/. [Accessed: 2026].
[8] I. Sommerville, Software Engineering, 10th ed. Pearson, 2015.

(Note: replace/expand with the exact sources actually consulted, in IEEE format, before submission.)

==================================================
APPENDIX A — SYSTEM MANUAL
==================================================

A.1 Prerequisites

Install, in order: Node.js 20 LTS; PostgreSQL 16 (recording the postgres superuser password set during installation); Git; and, optionally, VS Code with the ESLint, Prettier, and PostgreSQL extensions.

A.2 Project Setup

```
mkdir -p Backend/src/{config,db,middleware,repositories,services,controllers,routes}
mkdir -p Backend/migrations Backend/scripts
mkdir -p Frontend/src/{api,components,context,pages/admin,router}
cd Backend && npm init -y
cd ../Frontend && npm create vite@latest . -- --template react
```

Backend dependencies: `npm install express pg bcrypt jsonwebtoken joi morgan node-cron dotenv` and `npm install -D nodemon`. Set `"type": "module"` in `Backend/package.json` and add `"start": "node src/server.js"` and `"dev": "nodemon src/server.js"` scripts.

Frontend dependencies: `npm install react-router-dom axios` and `npm install -D tailwindcss @tailwindcss/vite @tailwindcss/forms`.

A.3 Environment Variables

`Backend/.env`:
```
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vehicle_auction
JWT_SECRET=replace_this_with_a_long_random_string_minimum_32_chars
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=10
NODE_ENV=development
```

`Frontend/.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=vehicle_img
```

A.4 Database Setup

```
psql -U postgres -c "CREATE DATABASE vehicle_auction;"
psql -U postgres -d vehicle_auction -f Backend/migrations/001_initial_schema.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/002_bids_auction_id.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/003_auction_winner.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/004_vehicle_fields.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/005_user_verification_status.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/006_auction_min_increment.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/007_auction_reserve_price.sql
psql -U postgres -d vehicle_auction -f Backend/migrations/008_vehicle_chassis_unique.sql
cd Backend && node scripts/seed-admins.js
```

The seed script creates the default admin account `owner@example.com` / `ChangeMe1`, which must be changed immediately after first production login.

A.5 Running the System

```
cd Backend && npm run dev      # API on port 3000
cd Frontend && npm run dev     # Dev server on port 5173, proxying /api to :3000
```

Verify with `GET http://localhost:3000/api/health`.

A.6 API Reference Summary

Auth: `POST /api/auth/register` (none), `POST /api/auth/login` (none). Users: `GET /api/users` (admin), `GET /api/users/me` (auth), `PATCH /api/users/:id/status` (admin). Vehicles: `GET /api/vehicles` (none), `GET /api/vehicles/:id` (none), `POST /api/vehicles` (admin), `PUT /api/vehicles/:id` (admin), `DELETE /api/vehicles/:id` (admin). Auctions: `GET /api/auctions` (none), `GET /api/auctions/won/me` (auth — must be declared before `/:id`), `GET /api/auctions/:id` (none), `POST /api/auctions` (admin), `PUT /api/auctions/:id` (admin), `DELETE /api/auctions/:id` (admin), `POST /api/auctions/:id/close` (admin), `POST /api/auctions/:id/winner` (admin), `GET /api/auctions/:id/winner` (none), `GET /api/auctions/:id/bids` (none), `POST /api/auctions/:id/bids` (verified buyer).

Error response format: `{ "message": "...", "details": [...] }`. Status codes: 400 bad input/business rule violation; 401 missing/invalid token; 403 wrong role or unverified buyer; 404 not found; 409 conflict; 500 server error.

A.7 Deployment

On the target Ubuntu 22.04 server: install Node.js 20, PostgreSQL 16, Nginx, and PM2; create the production database and a dedicated, non-superuser `auction_user`; run all migrations and the seed script against the production database with a freshly generated, strong `JWT_SECRET`; start the backend with `pm2 start src/server.js --name vehicle-auction-api` followed by `pm2 save` and `pm2 startup`; build the frontend with `npm run build`; and configure Nginx to proxy `/api/` to `localhost:3000` and serve the built `dist/` folder for all other routes with a `try_files $uri $uri/ /index.html;` SPA fallback. Configure SSL via Let's Encrypt/Certbot before going live, and restrict the firewall to ports 22, 80, and 443 only.

==================================================
APPENDIX B — USER MANUAL
==================================================

B.1 For Guests (Unauthenticated Visitors)

Visit the site to browse the public vehicle catalogue at `/vehicles`, using the search and filter controls (make, model, year, price range) to narrow results. Click any vehicle to view its full specification and images. Click through to an associated auction at `/auctions/:id` to view the live countdown timer, current highest bid, and full public bid history, without needing to register.

B.2 For Buyers

Register at `/register` with your name, email, and password. After registering you will be redirected to the login page; you may log in immediately, but your account will show as "pending" until an administrator verifies it. Once verified (you will need to log out and log back in for your account to reflect this), the bid form becomes available on any active auction's detail page. Enter a bid amount at least equal to the current highest bid plus the displayed minimum increment, and submit. You can monitor the reserve-price indicator on each auction (a colour-coded badge showing whether any hidden reserve has been met) without ever seeing the actual reserve amount. If you win an auction, you will see a "You Won!" banner the next time you log in, and the won auction will also appear on your `/profile` page with the final winning bid amount; dismissing the banner will not show it again on future visits.

B.3 For Administrators

Log in with your admin credentials (provisioned by the development team via the seed script, not through public registration) to be redirected to `/admin`. The Vehicles tab allows creating, editing, and deleting vehicle listings, including uploading one or more images directly to Cloudinary through the listing form. The Auctions tab allows scheduling an auction against a vehicle with a start time, end time, optional reserve price, and minimum bid increment, and provides "Close Auction" and manual winner-selection controls once an auction is active or ended. The Users tab lists all registered buyers with their current verification status and provides Verify/Reject actions; a pending-count badge in the navigation bar updates immediately after any verification action.

==================================================
APPENDIX C — MANAGEMENT REPORTS
==================================================

The system supports the following management-facing summary views, accessible to administrators through the admin dashboard: a list of all currently pending buyer verification requests (Users tab); a list of all currently active auctions with their current highest bid and time remaining (Auctions tab); and, per closed auction, a complete bid ladder showing every bid placed in descending order together with the final selected winner and winning amount, accessible via the auction's detail and winner pages. These views, together with the underlying `bids` and `auctions` tables, give the client an auditable record of every auction's outcome that did not exist under the previous manual process described in Section 2.1, directly addressing the "no centralised history" and "disagreements about winning bid" problems identified in the original requirements analysis.
