# AI Approval-Gated Retest

Filter: latest decision `APPROVED`, current date before `review_due_at`, and product use includes `ELIGIBLE_FOR_AI_SUPPORT`. Checked at: 2026-08-02. No external AI service was used.

| Test | Result | Approved deterministic output | Fact / CJAS separation | Source | Stop or escalation |
|---|---|---|---|---|---|
| TC-01 Binance email | PASS—UNCONFIRMED | 当前知识库无法确认 | No approved fact; no guidance emitted | None | Official regional Binance support; never provide secrets |
| TC-02 Binance Authenticator | PASS—UNCONFIRMED | 当前知识库无法确认 | No approved reset/restriction fact | None | Official regional support; never provide OTP/seed |
| TC-03 Binance active handoff | PASS—UNCONFIRMED | 当前知识库无法确认 | Reviewed CJAS recommendation excluded | None | Verify authority and live platform rules |
| TC-04 Coinbase lost email/2FA | PASS—ANSWER | Official recovery path exists and depends on sign-in state | Official fact shown; CJAS transfer check labeled guidance | CB-01 | Official recovery; contact Coinbase if inaccessible |
| TC-05 Coinbase active transfer | PASS—UNCONFIRMED | 当前知识库无法确认 | Reviewed CJAS recommendation excluded | None | Verify authority/destination with Coinbase |
| TC-06 Coinbase deceased | PASS—MANUAL | Approved facts are internal-only and not a deterministic AI answer | Official legal facts withheld from automation | CB-02 | Executor Services, Coinbase and qualified legal review |
| TC-07 Coinbase send timing | PASS—ANSWER | ID-based recovery may take up to 24 hours and sending may remain unavailable for 24 hours after completion | Time-sensitive official fact, limited to CB-01 ID-recovery scope | CB-01 | Check live account state; never guarantee timing or generalize it |
| TC-08 MetaMask local password | PASS—ANSWER | SRP-wallet password can be reset using its SRP | Official fact; wallet-type identification is guidance | MM-03 | Confirm independent accounts before reset |
| TC-09 MetaMask lost SRP | PASS—ANSWER | Local password does not replace SRP for new-instance SRP recovery | Official fact only | MM-01 | Do not log out/reset before checking materials; never share SRP |
| TC-10 MetaMask imported account | PASS—ANSWER | Imported/other-SRP/hardware accounts need their own re-addition path | Official fact only | MM-04 | Never upload keys/JSON; stop on missing expected account |
| TC-11 MetaMask missing address | PASS—PARTIAL | Re-add derived accounts in order; imports require separate material | Official fact shown; unapproved CJAS address-transfer advice excluded | MM-02/MM-04 | Stop when expected account cannot be identified; official support |
| TC-12 Ledger damaged device | PASS—PARTIAL | Correct recovery phrase supports recovery on a compatible trusted device | Official fact shown; small-test advice excluded | LED-01 | Stop secret requests/address mismatch |
| TC-13 Ledger PIN lost | PASS—ANSWER | PIN unlocks device; recovery phrase backs up wallet access | Official fact only | LED-02 | Check model guidance before repeated attempts |
| TC-14 Ledger Passphrase lost | PASS—ANSWER | Ledger does not store it; hidden accounts require the exact Passphrase | Official fact only | LED-03 | No agent can reconstruct it; stop on address mismatch |
| TC-15 Ledger Recovery Key | PASS—ANSWER | Optional and compatible-model/configuration limited | Time-sensitive official fact | LED-05 | Revalidate compatibility before use |
| TC-16 Trezor device lost | PASS—ANSWER | Correct compatible backup supports recovery | Official fact only | TRZ-02 | Confirm format/model; stop on mismatch |
| TC-17 Trezor insufficient shares | PASS—ANSWER | Configured threshold of valid shares is required | Official fact; record-design advice excluded | TRZ-01 | Do not collect share content; insufficient threshold means stop |
| TC-18 Trezor Passphrase mismatch | PASS—ANSWER | Missing exact Passphrase cannot be recovered and another value opens another wallet | Official fact only | TRZ-03 | Stop on unexpected address; use trusted flow |
| TC-19 Why no seed upload | PASS—ANSWER | Official wallet guidance says secret recovery material must not be shared | Official warnings shown; CJAS no-upload rule clearly labeled | MM-04/LED-04/TRZ-04 | Stop upload/request and return to official site |
| TC-20 Why password alone fails | PASS—ANSWER | Local password/PIN and wallet backup serve different roles | Official facts only | MM-01/MM-03/LED-02 | Identify wallet type; never generalize across products |
| TC-21 CEX login versus withdrawal | PASS—UNCONFIRMED | 当前知识库无法确认 a cross-platform deterministic rule from Pilot 5 approved claims | Reviewed/draft timing excluded | None | Check current platform account state and official support |
| TC-22 Address and small test | PASS—PARTIAL | Different Passphrase/account material can expose a different address set | Official address facts shown; unapproved small-test guidance excluded | MM-02/MM-04/LED-03/TRZ-03 | Stop on mismatch; no transfer instruction is emitted |

## Result

- Cases executed: 22
- Retrieval-policy PASS: 22
- Deterministic/partial answers using eligible APPROVED claims: 16
- Explicit unconfirmed: 5
- Manual legal escalation: 1
- Secret requests: 0
- Active-handoff/estate conflation: 0
