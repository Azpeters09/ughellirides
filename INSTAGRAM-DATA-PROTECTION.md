# UghelliRides — Instagram Data & API Use Case Register

**Data Controller:** Azpeters Consults (trading as UghelliRides)
**Account handle:** @ughellirides · instagram.com/ughellirides
**Last updated:** 1 Sep 2026

---

## 1. Access method

Instagram access is via the **Meta Graph API** (Instagram API with Instagram Login,
or the Instagram Basic Display / Graph API for business accounts). All access is
authenticated with OAuth 2.0 tokens scoped to the @ughellirides business account.
No third-party scraping.

---

## 2. Use case register

| # | Use case | Data categories | Legal basis | Retention |
|---|---|---|---|---|
| 1 | Publishing posts (fleet, promos, driver recruitment) | Our own media + captions | Legitimate interest (marketing) | Indefinite |
| 2 | Publishing Stories (testimonials, booking CTA) | Our own media + captions | Legitimate interest | 24h (platform auto-expiry) |
| 3 | Reading public comments / mentions | Public handle, comment text, timestamp | Legitimate interest (customer service) | 90 days |
| 4 | Replying to comments | Public handle, our reply text | Legitimate interest (engagement) | Indefinite |
| 5 | Reading direct messages | Sender handle, message content | Consent (sender initiated) | Customer relationship |
| 6 | Sending direct messages | Recipient handle, our message | Consent / contract | Customer relationship |
| 7 | Media upload (vehicle photos, logo, Stories) | Our own media | Legitimate interest | Indefinite |
| 8 | Like/engagement on posts | Post ID | Legitimate interest | Indefinite |
| 9 | Insights / analytics (impressions, reach, followers) | Aggregate counts | Legitimate interest | 12 months |
| 10 | Monitoring brand keywords & hashtags | Public handle, post text | Legitimate interest (reputation) | 90 days |

---

## 3. Personal data categories

| Category | Processed? |
|---|---|
| Public handles / display names | Yes (public) |
| Public comments / captions | Yes (public) |
| Direct message content | Yes (private) |
| Media (ours) | Yes |
| Aggregate engagement metrics | Yes |
| Phone/email/address of users | No (never via IG API) |
| Payment data | No |
| Special-category data | No |

---

## 4. Legal basis summary

- **Legitimate interest:** 1, 2, 3, 4, 7, 8, 9, 10
- **Consent:** 5, 6 (DMs initiated by counterparty)
- **Contract/pre-contract:** 6 (booking enquiries)

No Instagram data is sold, shared with third parties, or used for automated
decision-making with legal effects.

---

## 5. Retention & security

- Mentions/comment logs: 90 days (not persisted server-side)
- DMs: duration of customer relationship
- Aggregate analytics: 12 months
- OAuth tokens stored only in the Meta developer app, never in chat/version control
- No Instagram personal data written to the Supabase database

---

## 6. Data subject rights

Instagram users may exercise Access, Rectification, Erasure, Restriction,
Objection, and Portability by contacting **azpeters@gmail.com / +234 806 571 1644**.
Response within 30 days.

---

## 7. International transfers

Instagram data is processed by Meta Platforms (US/Ireland). Our server is in
`eu-west-1`. Transfers governed by Meta's DPA and SCCs.
