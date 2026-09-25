# Recovery Requirement Matrix v1

Legend: `R` REQUIRED, `C` CONDITIONAL, `O` OPTIONAL, `N/A` NOT_APPLICABLE, `U` UNCONFIRMED, `T` TIME_SENSITIVE. Each cell includes supporting Source ID; `CJAS` identifies guidance rather than platform fact.

| Platform | Asset existence | Normal login | Holder recovery | View assets | Change security | Withdraw/transfer | New device/factor restriction | Failed-condition fallback | Active handoff | Death/incapacity | Unrecoverable |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Binance | C BIN-01 | C BIN-01 | U | C BIN-01 | U | T BIN-01 | U | U | C CJAS | U BIN-02 | U |
| OKX | C OKX-01 | C OKX-01 | C OKX-01 | C OKX-01 | R OKX-01 | T OKX-01 | T OKX-01 | C OKX-01 | C CJAS | U | U |
| Coinbase | C CB-01 | C CB-01 | C CB-01 | C CB-01 | C CB-01 | T CB-03 | T CB-03 | C CB-01 | C CJAS | R CB-02 | U |
| Kraken | C KR-01 | C KR-01 | U | C KR-01 | C KR-01 | C KR-01 | T KR-01 | U | C CJAS | R KR-02 | U |
| Bybit | C BY-01 | C BY-01 | U | C BY-01 | C BY-02 | C BY-01 | T BY-01/02 | U | C CJAS | U | U |
| Bitget | C BG-01 | C BG-01 | C BG-01 | C BG-01 | R BG-01 | C BG-02 | T BG-01 | C BG-01 | C CJAS | U | U |
| KuCoin | C KC-01 | C KC-01 | C KC-02 | C KC-01 | R KC-02 | R KC-01 | T KC-02 | C KC-02 | C CJAS | U | U |
| MetaMask | C MM-02 | C MM-03 | R MM-02 | R MM-02 | C MM-03 | R MM-02 | N/A | C MM-02/04 | C CJAS | N/A | C MM-01 |
| Rabby | C RAB-01 | U | U | C RAB-01 | U | C RAB-01 | U | U | C CJAS | N/A | U |
| Trust Wallet | C TW-01 | C TW-01 | C TW-01 | C TW-01 | C TW-01 | C TW-01 | T TW-01 | C TW-01 | C CJAS | N/A | C TW-01 |
| Phantom | C PH-01 | C PH-02 | C PH-01/02 | C PH-03 | C PH-02 | C PH-03 | T PH-02 | C PH-01/02 | C CJAS | N/A | R PH-01 |
| OKX Wallet | C OKW-03 | C OKW-01 | R OKW-01/02 | C OKW-03 | C OKW-01 | R OKW-03 | T OKW-02 | C OKW-01/02 | C CJAS | N/A | R OKW-01/02 |
| Ledger | C LED-01 | R LED-02 | R LED-01 | R LED-01 | C LED-02 | R LED-02 | T LED-05 | C LED-01 | C CJAS | N/A | R LED-02/03 |
| Trezor | C TRZ-01 | C TRZ-02 | R TRZ-02 | R TRZ-02 | C TRZ-02 | R TRZ-02 | T TRZ-01/05 | C TRZ-02 | C CJAS | N/A | R TRZ-02/03 |
| OneKey | C ONE-01 | R ONE-02 | R ONE-02 | R ONE-02 | C ONE-02 | R ONE-02 | T ONE-02 | C ONE-02 | C CJAS | N/A | R ONE-01/02 |
| Keystone | C KEY-03 | C KEY-01 | C KEY-03/04 | C KEY-03 | C KEY-01 | C KEY-03 | T KEY-01 | C KEY-03/04 | C CJAS | N/A | C KEY-02/04 |
| SafePal | C SFP-02 | C SFP-03 | R SFP-02 | C SFP-02 | C SFP-03 | C SFP-02 | T SFP-03 | C SFP-02/03 | C CJAS | N/A | R SFP-01/02 |

## Interpretation guardrails

- `C` means the requirement depends on configuration, account type or scenario; it does not mean optional in practice.
- `T` must be revalidated at execution time and cannot promise a duration.
- `U` is excluded from deterministic answers and templates.
- Self-custody death/incapacity is `N/A` as a platform procedure; lawful authority remains external to technical wallet recovery.
