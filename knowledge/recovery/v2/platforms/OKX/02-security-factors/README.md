# OKX — security factors

Approved claim projections in this domain: 15.

- **OKXP-008** An unavailable authenticator can be reset through the official unavailable-factor flow. (OKXP-S01)
- **OKXP-010** Linking an authenticator requires email and phone verification in the cited flow. (OKXP-S04)
- **OKXP-011** The authenticator setup uses a current six-digit code to confirm linking. (OKXP-S04)
- **OKXP-012** The authenticator setup key must be protected and must not be stored in CJAS. (OKXP-S04)
- **OKXP-013** Changing or resetting the authenticator disables withdrawal/P2P for 24 hours in the cited scope. (OKXP-S04)
- **OKXP-014** An OKX passkey supports password-free authentication using a device or security key. (OKXP-S07)
- **OKXP-015** Removing a passkey requires full security verification in the cited flow. (OKXP-S07)
- **OKXP-016** Changing phone or Apple ID may make an existing passkey unavailable. (OKXP-S07)
- **OKXP-017** Removing a passkey without another passkey may trigger a 24-hour withdrawal/P2P restriction. (OKXP-S07)
- **OKXP-018** A new device can require authorization using bound one-time-password factors. (OKXP-S08)
- **OKXP-033** OKX exposes API management where unrecognized APIs can be deleted. (OKXP-S05)
- **OKXP-034** Device Management allows review and removal of unrecognized devices. (OKXP-S05)
- **OKXP-036** Security Center allows review and reset of unrecognized passkeys. (OKXP-S05)
- **OKXP-037** Account recovery and security review should use a trusted malware-free device. (OKXP-S05)
- **OKXP-049** A Succession Passport may record factor existence and recovery location, never factor values. (OKXP-S01)
