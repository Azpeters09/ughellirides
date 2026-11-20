# UghelliRides — Facebook Data & API Use Case Register

**Data Controller:** Azpeters Consults (trading as UghelliRides)
**Account:** @ughellirides · facebook.com/ughellirides
**Last updated:** 1 Sep 2026

---

## 1. Access method

Facebook access is via the **Meta Graph API** using a Page Access Token scoped to
the @ughellirides Page. All access is authenticated with OAuth 2.0. No third-party
scraping; no credential sharing.

---

## 2. Use case register

| # | Use case | Data categories | Legal basis | Retention |
|---|---|---|---|---|
| 1 | Publishing Page posts (fleet, promos, recruitment) | Our own media + text | Legitimate interest | Indefinite |
| 2 | Reading public comments/reactions | Public handle, comment text | Legitimate interest (customer service) | 90 days |
| 3 | Replying to comments | Public handle, our reply | Legitimate interest | Indefinite |
| 4 | Reading Page messages (Messenger) | Sender handle, message content | Consent (sender initiated) | Customer relationship |
| 5 | Sending Page messages | Recipient handle, our message | Consent / contract | Customer relationship |
| 6 | Media upload (vehicle photos, cover, logo) | Our own media | Legitimate interest | Indefinite |
| 7 | Page insights (reach, engagement, follower demographics) | Aggregate counts | Legitimate interest | 12 months |
| 8 | Monitoring brand keywords & competitor mentions | Public handle, post text | Legitimate interest (reputation) | 90 days |
| 9 | Facebook Pixel / analytics events (site visitors → ads) | Aggregate + pseudonymous event data | Legitimate interest (marketing) | 12 months |

---

## 3. Personal data categories

| Category | Processed? |
|---|---|
| Public handles / display names | Yes (public) |
| Public comments / posts | Yes (public) |
| Messenger message content | Yes (private) |
| Media (ours) | Yes |
| Aggregate engagement metrics | Yes |
| Pixel event data | Yes (pseudonymous) |
| Phone/email/address of users | No (never via FB API) |
| Payment data | No |
| Special-category data | No |

---

## 4. Legal basis summary

- **Legitimate interest:** 1, 2, 3, 6, 7, 8, 9
- **Consent:** 4, 5 (Messenger initiated by counterparty)
- **Contract/pre-contract:** 5 (booking enquiries)

> **Note on Pixel (use case 9):** If Facebook Pixel is enabled, visitors are
> pseudonymised. We publish a cookie/privacy notice on the website. Users may
> opt out via the cookie banner. No direct identifiers are sold or shared.

---

## 5. Retention & security

- Comment/monitoring logs: 90 days (not persisted server-side)
- Messenger: duration of customer relationship
- Aggregate analytics + pixel events: 12 months
- Page Access Token stored only in Meta developer app, never in chat/version control
- No Facebook personal data written to the Supabase database

---

## 6. Data subject rights

Facebook users may exercise Access, Rectification, Erasure, Restriction,
Objection, and Portability by contacting **bookings@ughellirides.online / +234 806 571 1644**.
Response within 30 days.

---

## 7. International transfers

Facebook data is processed by Meta Platforms (US/Ireland). Our server is in
`eu-west-1`. Transfers governed by Meta's DPA and SCCs.
