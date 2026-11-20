# UghelliRides — X (Twitter) Data & API Use Case Register

**Prepared for:** Data Protection compliance (NDPR / NDPA 2023 / GDPR)
**Data Controller:** Azpeters Consults (trading as UghelliRides)
**Data Processor (acting):** Hermes Agent (Nous Research) via the `xurl` CLI
**Account handle:** @ughellirides · x.com/ughellirides
**Last updated:** 1 Sep 2026

---

## 1. Purpose of this register

This document records every purpose for which UghelliRides accesses or processes
X (Twitter) data through the X API, the legal basis for each, the data categories
involved, retention, and the rights available to data subjects. It is maintained
to satisfy Articles 30 (records of processing) and 13/14 (transparency) of GDPR
and the equivalent obligations under Nigeria's NDPR/NDPA.

---

## 2. Access method

All X data access is via the **`xurl` CLI** (the official X developer platform CLI),
authenticated with **OAuth 2.0 PKCE** tokens scoped to the @ughellirides account.
No third-party scraping, no credential sharing, and no personal X data is stored
in the Hermes conversation context or memory.

---

## 3. Use case register

| # | Use case | Data categories accessed | Legal basis | Retention | Automated? |
|---|---|---|---|---|---|
| 1 | **Publishing posts** (fleet, promos, driver recruitment) | Text content authored by us (no personal data of others) | Legitimate interest (marketing own business) | Indefinite (public posts) | Semi (drafts by agent, human approval) |
| 2 | **Replying / quoting public posts** | Public handle, post text, post ID | Legitimate interest (customer engagement) | Indefinite | Semi |
| 3 | **Monitoring mentions & brand keywords** (`@ughellirides`, "Ughelli car hire") | Public handle, public post text, timestamp, post ID | Legitimate interest (reputation, customer service) | 90 days | Yes (scheduled) |
| 4 | **Reading direct messages (DMs)** | Sender handle, message content, timestamp | Consent (sender initiated contact) | Duration of customer relationship | No |
| 5 | **Sending direct messages (DMs)** | Recipient handle, message content (ours) | Consent / contract (responding to enquiry) | Duration of customer relationship | No |
| 6 | **Reading own timeline / mentions** | Public handles, public post content | Legitimate interest (engagement) | 90 days | No |
| 7 | **Liking / reposting / bookmarking** | Post ID, public handle | Legitimate interest (engagement) | Indefinite | No |
| 8 | **Following / unfollowing** | Public handle, user ID | Legitimate interest (network building) | Until unfollowed | No |
| 9 | **Blocking / muting** | Public handle, user ID | Legitimate interest (safety, spam control) | Until unblocked | No |
| 10 | **Media upload** (vehicle photos, logo) | Media files we own | Legitimate interest (marketing) | Indefinite | No |
| 11 | **Analytics / public metrics** (post impressions, engagement counts) | Aggregate counts (no identified individuals) | Legitimate interest (campaign performance) | 12 months (aggregate) | Yes |
| 12 | **Monthly reporting** (follower growth, response times) | Aggregate metrics only | Legitimate interest (business reporting) | 12 months | Yes |

---

## 4. Categories of personal data processed

| Category | Collected? | Where |
|---|---|---|
| **Public X handles / display names** | Yes (public) | Mentions, replies, timelines |
| **Public post text** | Yes (public) | Search, mentions, timeline |
| **Direct message content** | Yes (private) | DM inbox/outbox |
| **Post / user IDs** | Yes | Engagement, search |
| **Media (images/video)** | Only our own | Uploads |
| **Aggregate engagement metrics** | Yes | Analytics |
| **Phone numbers / emails / addresses of X users** | **No** — never requested or stored via X API | — |
| **Payment / financial data of X users** | **No** — never processed via X API | — |
| **Special-category data** (health, religion, etc.) | **No** — never processed via X API | — |

---

## 5. Legal basis summary (NDPR / GDPR)

| Basis | Use cases |
|---|---|
| **Legitimate interest** | 1, 2, 3, 6, 7, 8, 9, 10, 11, 12 |
| **Consent** | 4, 5 (DMs are initiated by the counterparty) |
| **Contract / pre-contract** | 5 (responding to booking enquiries) |

> **No X data is sold, shared with third parties, or used for automated
> decision-making about individuals (profiling that produces legal effects).**

---

## 6. Data minimisation & security

- Only data necessary for each use case is accessed (see §3).
- OAuth tokens are stored **only** in `~/.xurl` on the server, never in chat, memory, or version control.
- DMs and private content are not copied into Hermes conversation context or logs.
- No X personal data is written to the UghelliRides database (Supabase) except aggregate, non-identifying metrics.
- Access is limited to the single authenticated @ughellirides account.

---

## 7. Retention schedule

| Data | Retention | Deletion |
|---|---|---|
| Public posts/replies (ours) | Indefinite (public record) | Manual via `xurl delete` |
| Mentions/monitoring logs | 90 days | Auto (not persisted server-side) |
| DMs | Duration of customer relationship | X account settings / manual |
| Aggregate analytics | 12 months | Manual |
| OAuth tokens | Until revoked | `xurl auth apps remove` |

---

## 8. Data subject rights

X users may exercise the following rights by contacting
**bookings@ughellirides.online** or **+234 806 571 1644**:

- **Access** — request a copy of any personal data we hold via X
- **Rectification** — correct inaccurate data
- **Erasure** — request deletion (we will delete our copies and unblock/unfollow as needed)
- **Restriction** — limit processing while a dispute is resolved
- **Objection** — object to processing under legitimate interest
- **Data portability** — receive their data in a structured format

We respond within **30 days** (GDPR) / in line with NDPR guidance.

---

## 9. International transfers

X data is processed by X Corp (United States) and accessed by our server
(hosted in Europe, `eu-west-1`). No additional transfer occurs beyond X's own
platform processing, which is governed by X's Data Processing Agreement and
Standard Contractual Clauses.

---

## 10. Contact & accountability

| Role | Contact |
|---|---|
| Data Controller | Azpeters Consults · azpetersconsults@gmail.com |
| Customer contact | bookings@ughellirides.online · +234 806 571 1644 |
| Data Protection queries | As above |
