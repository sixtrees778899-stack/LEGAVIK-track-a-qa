# CJAS Recovery Map Knowledge Activation — Product Specification

Status: Product specification for CEO/Product Architect review

Knowledge baseline: `cc55be7a0d3cd46677a68472d30bba337d8c7880`

Implementation status: NOT STARTED

## Executive decision

The 117 Approved Claims can drive a **scope-gated CEX Recovery Map MVP**, but they cannot support a globally uniform Binance/OKX/Coinbase template. The product must resolve platform, region, account type, client and enabled factors before selecting knowledge. When no exact match exists, it may collect neutral recovery facts and show conservative CJAS safety guidance, but it must not import another region’s policy, waiting period or official process.

The user sees simple questions and actionable explanations. Claim IDs, evidence grades, confidence calculations, internal Scope fields, Rule IDs and legal-entity identifiers remain internal unless a scope difference changes what the user must do.

---

## 1. Platform & Region Resolver

### 1.1 Minimal user inputs

The resolver asks only:

1. `platform`: Binance / OKX / Coinbase.
2. `registration_geography`: country or region where the account was registered or is served.
3. `account_class`: Personal / Business or Institutional.
4. `client_mode`: App / Web / Both / Unsure.
5. `enabled_factors`: Email, phone/SMS, authenticator, passkey, security key, push notification, trusted contacts, withdrawal allowlist/address book, API access and Other.

The UI may infer client mode from the current session only as a suggestion. It must never infer registration country, account class, legal entity or enabled factors from IP address alone.

### 1.2 Internal resolution context

```text
ResolutionContext
  platform
  geography
  legal_entity = resolved value | UNCONFIRMED_ENTITY
  platform_variant
  product_scope
  account_type
  version_scope
  client_mode
  enabled_factors[]
  resolution_quality = EXACT | PARTIAL | UNRESOLVED
```

This is a product DTO proposal, not a Schema change.

### 1.3 Claim selection gate

A Claim is selectable only when all are true:

- `lifecycle_status == APPROVED`;
- required product eligibility is present;
- `review_due_at` has not passed and no stale trigger is active;
- platform matches exactly;
- account type and product scope do not conflict;
- geography is exact, or the Claim is explicitly Global;
- version/client scope does not conflict;
- legal entity is exact, or both the user and Claim remain explicitly unresolved;
- the downstream component does not widen Scope or Confidence.

`UNCONFIRMED_ENTITY` is a warning state, not a wildcard. `Other` geography is not Global.

### 1.4 Resolution order

1. Exact platform + geography + account type + product + version/client match.
2. Explicitly Global Approved Claim with compatible product/account/version scope. Phase 1 currently has none.
3. Narrower Approved CJAS Guidance that is valid for the same resolved context.
4. Neutral data-capture prompt with no platform-policy assertion.
5. Conservative notice and official/human escalation.

The resolver must never fall sideways from Australia to United States or EEA knowledge.

### 1.5 Resolver output

```text
ResolutionResult
  exact_claims[]
  conservative_guidance[]
  internal_only_claims[]
  unresolved_dimensions[]
  region_conflicts[]
  required_user_questions[]
  manual_escalation_reasons[]
  source_freshness_state
```

Fail-closed conditions:

- platform unknown;
- account class conflicts with the knowledge product scope;
- all matching Claims are stale or non-Approved;
- a region-specific policy is requested but only another region is available;
- legal/succession case attempts to use ordinary account-holder recovery;
- the user asks to bypass KYC, impersonate the holder or use third-party credentials.

### 1.6 User-facing fallback

When resolution is incomplete:

> 我们尚未确认该地区或账户类型的完整官方流程。您仍可记录账户线索、安全因素和材料位置；执行恢复或转移前，请以当前官方页面或人工支持为准。

Do not show `UNCONFIRMED_ENTITY`, Confidence scores or raw evidence fields.

---

## 2. Three-platform regional commonality and differences

### 2.1 Binance

Phase 1 evidence is Binance Global educational content with `UNCONFIRMED_ENTITY`; it is not proof that one operational process applies to Binance.US, Australia, EEA, UK or every other entity.

**Conservative base conditions that may be collected without claiming global policy**

- masked account identifier;
- existence and availability of password, linked email, phone/SMS, authenticator, passkey and security key;
- trusted-device review status;
- anti-phishing-code existence;
- API-access existence and revocation location;
- address-book/withdrawal-whitelist existence;
- intended owner-controlled destination and network;
- official-support escalation location.

Supporting Claims: `BINP-002–013`, `BINP-015–020`, `BINP-035–036`, `BINP-045–050`, excluding non-Approved IDs. Rule/Guidance projections use matching `BINP-R-*` and `BINP-G-*` IDs.

**Region-dependent additions**

- factor-reset procedure and waiting period;
- KYC/face verification;
- withdrawal appeal and risk-review procedure;
- Travel Rule/Satoshi Test applicability;
- death/incapacity process.

**Backend-only differences**

- source is Academy versus operational Help Center;
- serving entity unresolved;
- review date and evidence confidence.

**Additional user questions**

- “您的账户由哪个Binance网站或App地区版本提供服务？”
- “安全因素是否刚刚修改？”
- “提现页面是否显示审核、冻结或地区合规要求？”

**Mandatory escalation**

- Binance.US/local-entity flow without matching knowledge;
- lost email/phone/Authenticator with no exact official process;
- KYC or face-verification failure;
- withdrawal appeal/restriction;
- death, incapacity, disputed ownership or third-party access.

### 2.2 OKX

All Approved operational facts are scoped to OKX US pages. There is no confirmed common operational rule across OKX Australia, EEA and other entities.

**Known US base conditions**

- registered email/phone and password-reset route;
- configured authenticator/passkey/device factors;
- factor-reset and time-sensitive withdrawal restrictions;
- account-risk state;
- withdrawal verification combination;
- network, Memo/Tag, whitelist and sub-account state;
- address/device/API review.

Supporting Claims: Approved `OKXP-001–039`, `OKXP-044–045`, `OKXP-049`; matching `OKXP-R-*` and `OKXP-G-*` projections.

**Only partial-region additions**

- 24-hour restrictions after enumerated security changes: US scope only;
- withdrawal factor combinations and threshold: US scope only;
- high-risk-address restriction: account-state and US-page scope;
- P2P impacts: availability and entity dependent.

**Backend-only differences**

- exact source page and update date;
- whether the rule is time-sensitive;
- Confidence and stale triggers.

**Additional user questions**

- “这是OKX US、Australia、EEA还是其他地区账户？”
- “最近24小时是否修改密码、邮箱、手机、Authenticator或Passkey？”
- “账户当前是否显示限制或人工审核？”
- “资产是否在子账户？”

**Mandatory escalation**

- any non-US account requiring a deterministic policy answer;
- unresolved risk-control review;
- judicial or compliance restriction;
- death/incapacity or third-party authority;
- uncertain network/Memo/Tag.

### 2.3 Coinbase

Core facts apply to Coinbase Retail with unresolved serving entity. `CBP-038–041` are EEA-specific. Nothing in this set authorizes reuse for Vault, Advanced or Prime/Institutional.

**Retail base conditions**

- password reset state;
- enabled 2-step methods and at least one usable backup;
- lost phone/authenticator/security-key route;
- ID-recovery readiness;
- trusted-contact configuration and limits;
- send restriction after recovery;
- device/session review and allowlist state;
- official support anti-impersonation controls.

Supporting Claims: Approved `CBP-002–041`, excluding downgraded IDs, plus Internal-only `CBP-044–047,049`; matching `CBP-R-*` and `CBP-G-*` projections.

**Region/product-specific additions**

- EEA recipient information and self-hosted-wallet ownership test;
- Retail-only trusted-contact and account-recovery behavior;
- Executor/deceased route;
- Vault, Advanced and Prime controls remain unavailable.

**Backend-only differences**

- EEA versus unresolved Retail geography;
- support/article freshness;
- Internal-only classification for legal authority.

**Additional user questions**

- “这是普通Coinbase个人账户、Vault、Advanced还是Prime/机构账户？”
- “是否位于EEA并准备转向自托管钱包？”
- “Trusted Contacts是否在事件发生前已完成设置？”
- “恢复页面是否显示发送限制仍未结束？”

**Mandatory escalation**

- Vault/Prime/Institutional flows;
- death, incapacity, executor, POA or disputed authority;
- ID verification failure;
- account compromise;
- send restriction that differs from the documented Retail state.

---

## 3. Six-module Claim mapping

Requirement codes: `M` mandatory, `C` conditionally mandatory, `R` recommended, `O` optional. Raw IDs remain internal.

### Module 1 — 资产与账户

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| Platform | Approved platform Claim set; resolver system rule | M | Always | Never |
| Masked account identifier | `BINP-045`; `OKXP-001`; Coinbase neutral capture | M | CEX selected | Never |
| Registration country/region | Scope gate; no single Claim | M | Always | Never |
| Account class/product | Coinbase product boundary; OKX sub-account `OKXP-032` | M | Always | Never |
| Serving site/App variant | Scope gate | C | Resolver cannot identify exact variant | Exact variant already confirmed |
| Asset categories and approximate presence | neutral product capture; no secret | M | Always | Never |
| Sub-account indicator | `OKXP-032 / R-032 / G-032` | C | OKX | Other platform |
| API use indicator | `BINP-015–017,049`; `OKXP-033` | C | User enables API | API not used |

The module never asks for full account password, API key/secret, OTP or full identity document.

### Module 2 — 恢复条件

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| Password existence and reset route | `BINP-002–003`; `OKXP-002–005`; `CBP-002–003` | M | Always | Never |
| Linked email availability | `BINP-004`; `OKXP-006`; Coinbase recovery `CBP-020–022` | M | Email factor/platform requires it | Not applicable only if resolver confirms |
| Phone/SMS availability | `BINP-005`; `OKXP-007,020`; `CBP-018` | C | Factor enabled | Factor disabled |
| Authenticator availability | `BINP-006`; `OKXP-008,010–013`; `CBP-011,017` | C | Enabled | Disabled |
| Passkey availability | `BINP-008`; `OKXP-014–017`; `CBP-009–010` | C | Enabled | Disabled |
| Security-key availability/backup | `BINP-007`; `CBP-007–008,016` | C | Enabled | Disabled/unsupported |
| Push notification state | `CBP-012–013,019` | C | Coinbase push enabled | Other cases |
| Trusted contacts readiness | `CBP-024–025` plus Internal-only `CBP-044–046` | C | Coinbase and feature enabled | Other platforms/disabled |
| Factor values | prohibition Rules from `*-R-*` stop/guidance Claims | Never collect | Never | Always |

Module completion requires an answer for each enabled factor: `AVAILABLE`, `UNAVAILABLE_WITH_OFFICIAL_PATH`, `UNKNOWN`, or `NOT_ENABLED`.

### Module 3 — 位置与查找

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| Official login/support entry location | platform Approved recovery/access Claims | M | Always | Never |
| Recovery-material location hint | `BINP-046`; `OKXP-012,049`; Coinbase factor Claims | C | Relevant factor exists | No factor/material |
| Trusted-device identification hint | `BINP-012,047`; `OKXP-018,034`; `CBP-030–031` | R | Device-based access | No known device |
| Address-book/allowlist location | `BINP-018–020,048`; `OKXP-031,035`; `CBP-032` | C | Feature enabled | Disabled |
| Destination public address | withdrawal/Verified Transfer Claims | C | Owner-Directed Exit selected | Holder recovery without exit |
| Identity-document location hint | `CBP-022`; OKX official support fallback | C | Official flow requires ID | Not requested |

Only location and identification hints are stored. Attachments must be redacted and must not contain secrets or complete identity documents.

### Module 4 — 恢复与转移步骤

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| Selected path A/B/C | control boundary + Internal-only legal Claims | M | Always | Never |
| Official recovery entry | OKX `002,006–009`; Coinbase `016–027`; Binance conservative support | C | Path A | Path B only with current access |
| Security-change cooldown check | `BINP-003`; `OKXP-005,013,017,020`; `CBP-026–027` | C | Matching region/factor change | No matching Claim or no change |
| Account restriction check | `OKXP-021–023,045`; Coinbase send restriction | M | Exact applicable Claim | Otherwise show neutral status question |
| Destination/network/Memo validation | `BINP-018–025,032`; `OKXP-025–031,044`; `CBP-032,038–041` | C | Path B | Path A without transfer |
| Small transfer | `BINP-022`; Coinbase EEA `040–041`; other platform conservative Drill guidance only | C | Exact Claim or separately accepted CJAS Drill | No owner-controlled destination |
| Receipt/hash evidence | approved Drill-eligible Claims only | C | Small test performed | Test not performed |
| Controlled completion | platform Drill candidate | R | Test passed | Test failed/pending |
| Stop/escalate | Approved Stop/Warning Rules | M | Any anomaly | No anomaly |

No step may claim Lab verification. Transaction execution is outside this specification and requires separate authorization.

### Module 5 — 协助人

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| “是否需要协助？” | product framework | M | Always | Never |
| Support role and boundary | platform official-support Claims | C | User answers Yes | User answers No |
| Contact timing | escalation Rules | C | Assistance required | No assistance |
| Trusted-contact capability limits | Coinbase `CBP-024–025,044–046` | C | Coinbase trusted contacts | Other platform |
| Legal/executor role | Binance `043–044`; Coinbase `047,049` and unresolved legal gaps | Internal/C | Path C | Paths A/B |
| Prohibited authority claim | CEX control boundary | M warning | Third party involved | Holder acts personally |

The module states that a helper does not obtain account ownership, transaction authority or permission to impersonate the holder.

### Module 6 — 给未来恢复人的嘱托

| Product item | Claim / Rule / Guidance lineage | Requirement | Show when | Hide when |
|---|---|---|---|---|
| Plain-language recovery purpose | Approved CJAS Guidance | O | User chooses | Never forced |
| Selected A/B/C path summary | resolver/mapping output | R | Path selected | No path yet |
| Stop conditions | platform Stop Claims | R | Applicable | No applicable Claim |
| Official escalation reminder | Internal-only legal Claims | C | Path C/uncertain authority | Normal holder path |
| Personal text/audio/video message | existing product capability; no knowledge assertion | O | User chooses | User skips |
| Disclaimer | governance rule | M presentation | Message used | Can remain short when skipped |

Personal messages do not satisfy missing structured recovery conditions and are not legal instruments.

---

## 4. Dynamic question generation rules

### 4.1 Question contract

Each generated question contains internal metadata:

```text
question_id
module_id
answer_type
requirement: M | C | R | O
show_when[]
hide_when[]
claim_refs[]
rule_refs[]
guidance_refs[]
scope_guard
freshness_guard
review_target
```

This is configuration design, not a Schema modification.

### 4.2 Generation sequence

1. Ask the five resolver questions.
2. Select only fresh Approved Claims with required eligibility.
3. Group semantically related Claims into one user task; never expose one question per Claim.
4. Generate condition questions only for factors the user selected.
5. Add platform/region-specific questions only after an exact match.
6. Generate unresolved-scope questions or conservative notices instead of importing another region.
7. Generate Review requirements from the same question configuration and Rule references.

### 4.3 Examples

- If `platform=OKX`, `region=United States`, `authenticator=enabled`, show authenticator availability and applicable cooldown questions from `OKXP-008,013`.
- If `platform=OKX`, `region=Australia`, do not show the US 24-hour rule as fact; ask whether the current account displays a restriction and link to official confirmation.
- If `platform=Coinbase`, `product=Prime`, stop Retail template resolution and require a product-specific official path.
- If `platform=Coinbase`, `region=EEA`, `path=B`, show recipient information and ownership-test tasks from `CBP-038–041`.
- If `path=C`, hide ordinary transfer instructions until official/legal authority is confirmed.

---

## 5. Frontend simplification strategy

- Dashboard first; modules are independently accessible.
- One user task per card, not one Claim per page.
- Prefer `Yes / No / Unsure`, multi-select and status chips.
- Preselect factor questions from the resolver; allow correction.
- Use conditional expansion for unavailable factors and restrictions.
- Auto-link one answer to all modules that need it.
- Prefer recognized choices for platform, region, product and factor type.
- Use free text only for masked identifier, location hint, custom condition and personal message.
- Never show internal Claim, Rule, Evidence, Confidence or legal-entity IDs.
- Show a region badge only when it changes the operation: e.g. “仅适用于OKX US”.
- Translate uncertainty into an action: confirm current official page, check account prompt or contact official support.

---

## 6. Review localization standard

Every Review issue must contain:

```text
platform_label
asset_or_account_label
module_label
field_or_condition_label
missing_or_risk_statement
why_needed
how_to_fix
severity: BLOCKING | RECOMMENDATION | READY | VERIFIED
generation_blocked: boolean
skippable: boolean
escalation: NONE | OFFICIAL_SUPPORT | HUMAN_LEGAL
navigation_target
claim_refs (internal)
rule_refs (internal)
```

### Blocking

- platform/region/account class missing;
- enabled factor has no availability answer;
- Path A lacks an official recovery route when a required factor is unavailable;
- Path B lacks owner-controlled destination or has address/network/Memo uncertainty;
- active restriction/cooldown is ignored;
- Path C lacks official/legal escalation;
- a stale or mismatched-region Claim is being used as deterministic policy;
- user indicates impersonation, KYC bypass or third-party credential takeover.

### Recommendation only

- no trusted-device hint;
- no redacted supporting attachment;
- no optional personal message;
- Drill not yet performed when generation is otherwise safe.

Example:

> Coinbase · 主要账户 · 恢复与转移步骤：恢复后发送限制尚未确认。请查看当前账户提示，确认发送功能已恢复后再进行接收地址测试。本项阻止“已验证”状态，但不阻止保存草稿。

---

## 7. Recovery Drill and Verified Transfer embedding

### 7.1 Five Drill groups

1. **资料检查** — factor inventory, official entry, location hints and destination readiness.
2. **本人账户恢复演练** — holder performs official sign-in/recovery; no third-party impersonation.
3. **接收地址验证** — holder confirms destination ownership, asset, network and Memo/Tag.
4. **小额转账验证** — only after applicable cooldown/restriction checks and separate transaction authorization.
5. **官方升级准备** — evidence/location checklist for official support or legal professional; not a takeover workflow.

### 7.2 Drill states

`NOT_STARTED → MATERIALS_CHECKED → OFFICIAL_FLOW_CONFIRMED → TRANSFER_READY → TEST_TRANSFER_CONFIRMED → VERIFIED`

`VERIFIED` requires:

- all applicable required checks pass;
- holder-controlled destination confirmed;
- applicable cooldown observed;
- small transfer received;
- public test transaction hash recorded by reference;
- no blocking Stop Rule;
- evidence reviewed for the specific version/region.

Before Recovery Lab evidence exists, the UI may say:

- “依据官方资料准备”；
- “您已完成本次演练”；
- “本账户的测试转账已验证”。

It must not say:

- “CJAS已实测”；
- “平台保证可恢复”；
- “全球通用”；
- “第三人可直接接管”。

---

## 8. Knowledge immediately activatable in Recovery Map

Subject to the Resolver and eligibility gate:

- 109 Template-eligible Approved Claims;
- 110 Guidance-eligible Approved Claims;
- 43 Rule Engine candidates for product review, not production activation;
- 48 Drill-eligible Approved Claims;
- neutral collection of masked account identity, region, account class, factor existence, locations and official routes;
- platform-specific Stop Conditions and secret-handling prohibitions;
- Coinbase EEA-only tasks when EEA is an exact match;
- OKX US-only tasks when United States is an exact match.

“Immediately activatable” means suitable for configuration/mapping implementation after approval, not already connected.

---

## 9. Knowledge limited to conservative notices

- Binance Academy-derived operational implications without serving-entity confirmation;
- any OKX US fact shown to an Australian, EEA or other account;
- general Coinbase Retail facts when product/entity cannot be resolved;
- time-sensitive waiting periods when current account prompts differ;
- risk-control outcomes determined case by case;
- general small-test/staged-transfer guidance without a matching official platform flow;
- any Reviewed Claim, which may inform internal research but not deterministic questions.

---

## 10. Knowledge waiting for Recovery Lab

- actual success of factor-reset flows by region/account configuration;
- observed cooldown duration and post-recovery withdrawal/send availability;
- new-device behavior;
- address-book/allowlist changes and activation timing;
- owner-controlled small transfer and transaction-hash verification;
- cross-client App/Web differences;
- repeatability across independent tester accounts;
- evidence needed to raise Confidence from Medium to High.

Legal/succession routes require official/legal review, not Lab simulation through impersonation.

---

## 11. Minimum developable scope

### Included

1. Read-only knowledge catalog loader for the three approved platform packages.
2. Platform & Region Resolver with exact/partial/unresolved outcomes.
3. Configuration-only six-module mapping through the existing Mapper boundary.
4. Five minimal resolver questions and conditional factor questions.
5. Eligibility, freshness, Scope and Confidence guards.
6. Three-path selection: A holder recovery, B owner-directed exit, C official/legal escalation.
7. Review localization contract and navigation targets.
8. Drill presentation as `OFFICIAL ONLY`, with no transaction execution.
9. Tests proving no cross-region fallback and no non-Approved/stale Claim activation.

### Excluded

- Schema changes;
- automated transaction or wallet connection;
- Recovery Lab execution;
- AI service;
- Tier 2 platforms;
- Prime/Vault/Institutional support;
- legal advice or authority determination;
- formal Platinum badges.

---

## 12. Phased development plan

### Activation A — Resolver and contract

- machine catalog read model;
- exact Scope filtering;
- stale/eligibility rejection;
- deterministic selection tests;
- no UI redesign.

### Activation B — Knowledge-to-module mapping

- configuration tables for six modules;
- question grouping and conditions;
- Mapper-only output;
- Review uses the same Rule references.

### Activation C — CEX three-path experience

- A/B/C path selection;
- conservative fallback presentation;
- assistance/legal boundary;
- no account action execution.

### Activation D — Drill presentation

- materials, holder recovery, destination, small-test readiness and official escalation groups;
- official-only labels;
- Lab hooks remain inactive until separately authorized.

Each activation requires Code, Test, Security, Product Architecture and CEO Experience gates before the next begins.

---

## 13. SAFE TO START Recovery Map code refactor

**CONDITIONAL YES — limited to the Minimum Developable Scope after CEO/Product Architect approval.**

Safe conditions:

- Schema v2 remains frozen;
- UI cannot construct Knowledge directly and continues through Mapper;
- Resolver is fail-closed and never treats `Other` or `UNCONFIRMED_ENTITY` as Global;
- only fresh Approved Claims with explicit product eligibility activate;
- Rules, Guidance, Templates and Drill inherit Claim Scope/Confidence;
- no transaction execution, wallet, AI, Lab assertion or Tier 2 work;
- Binance/OKX/Coinbase remain Platinum Candidate.

Not safe:

- a global generic template that silently consumes US/EEA Claims;
- presenting Official-only Drill content as CJAS tested;
- using A–D access/recovery evidence to mark E–G control/transfer complete;
- exposing a third-party account-takeover workflow.

This specification does not itself authorize implementation.
