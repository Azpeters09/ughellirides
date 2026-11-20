# UghelliRides — TikTok Data & API Use Case Register

**Data Controller:** Azpeters Consults (trading as UghelliRides)
**Account:** @ughellirides · tiktok.com/@ughellirides
**Last updated:** 1 Sep 2026

---

## 1. Access method

TikTok access is via the **TikTok API for Business / Content Posting API** using
OAuth 2.0 tokens scoped to the @ughellirides account. For the initial phase,
posting is likely manual or via a scheduling tool (Later/Buffer). No third-party
scraping.

---

## 2. Use case register

| # | Use case | Data categories | Legal basis | Retention |
|---|---|---|---|---|
| 1 | Publishing videos (behind-the-wheel, driver spotlight) | Our own media + captions | Legitimate interest | Indefinite |
| 2 | Reading public comments | Public handle, comment text | Legitimate interest (customer service) | 90 days |
| 3 | Replying to comments | Public handle, our reply | Legitimate interest | Indefinite |
| 4 | Reading direct messages | Sender handle, message content | Consent (sender initiated) | Customer relationship |
| 5 | Sending direct messages | Recipient handle, our message | Consent / contract | Customer relationship |
| 6 | Video/media upload | Our own media | Legitimate interest | Indefinite |
| 7 | Analytics (views, engagement, follower growth) | Aggregate counts | Legitimate interest | 12 months |
| 8 | Monitoring brand keywords & hashtags | Public handle, post text | Legitimate interest (reputation) | 90 days |

---

## 3. Personal data categories

| Category | Processed? |
|---|---|
| Public handles / display names | Yes (public) |
| Public comments / captions | Yes (public) |
| Direct message content | Yes (private) |
| Media (ours) | Yes |
| Aggregate engagement metrics | Yes |
| Phone/email/address of users | No (never via TikTok API) |
| Payment data | No |
| Special-category data | No |

---

## 4. Legal basis summary

- **Legitimate interest:** 1, 2, 3, 6, 7, 8
- **Consent:** 4, 5 (DMs initiated by counterparty)
- **Contract/pre-contract:** 5 (booking enquiries)

No TikTok data is sold, shared with third parties, or used for automated
decision-making with legal effects.

---

## 5. Retention & security

- Comment/monitoring logs: 90 days (not persisted server-side)
- DMs: duration of customer relationship
- Aggregate analytics: 12 months
- OAuth tokens stored only in the TikTok developer app, never in chat/version control
- No TikTok personal data written to the Supabase database

---

## 6. Data subject rights

TikTok users may exercise Access, Rectification, Erasure, Restriction,
Objection, and Portability by contacting **bookings@ughellirides.online / +234 806 571 1644**.
Response within 30 days.

---

## 7. International transfers

TikTok data is processed by TikTok Inc (US/Singapore). Our server is in
`eu-west-1`. Transfers governed by TikTok's DPA and SCCs.

---

## 8. Note on minors (TikTok-specific)

TikTok's audience includes minors. UghelliRides does not target minors, does not
process minor data, and where a DM indicates the sender is a minor, the
conversation is closed with a request to have an adult contact us.
