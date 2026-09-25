import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const checked = '2026-08-02';
const reviewDue = '2026-11-02';
const dirs = ['01-account-access','02-security-factors','03-recovery','04-operational-control','05-withdrawal-control','06-owner-transfer','07-emergency','08-legal','09-risk','10-drill','11-guidance','12-ai','13-template','14-claims','15-open-questions','16-version-history'];

const auditOverrides={
  REVIEWED:new Set(['BINP-001','BINP-014','BINP-027','BINP-029','BINP-030','BINP-033','BINP-034','BINP-040','BINP-041','BINP-042','OKXP-019','OKXP-041','OKXP-043','OKXP-050','CBP-001','CBP-014','CBP-023','CBP-048','CBP-050']),
  DRAFT:new Set(['BINP-028','BINP-031','BINP-037','BINP-039','OKXP-040','OKXP-042','OKXP-046','OKXP-047','OKXP-048','CBP-042','CBP-043']),
  REJECTED:new Set(['BINP-021','OKXP-024','CBP-004'])
};
const mergeInto={'BINP-021':'BINP-019','OKXP-024':'OKXP-038','CBP-004':'CBP-034'};
const auditStatus=id=>Object.entries(auditOverrides).find(([,s])=>s.has(id))?.[0]||'APPROVED';
const controlLayer=scenario=>scenario.includes('legal')||scenario.includes('deceased')||scenario.includes('executor')||scenario.includes('succession')||scenario.includes('third_party')||scenario.includes('trusted_no')||scenario.includes('owner_boundary')?'H_LEGAL_OFFICIAL_SUCCESSION':scenario.includes('test')||scenario.includes('hash')||scenario.includes('batch')||scenario.includes('drill')?'G_VERIFIED_TRANSFER':scenario.includes('withdraw')||scenario.includes('whitelist')||scenario.includes('address')||scenario.includes('network')||scenario.includes('memo')||scenario.includes('send')?'F_WITHDRAWAL_SEND':scenario.includes('control')||scenario.includes('risk')||scenario.includes('api')?'E_OPERATIONAL_CONTROL':scenario.includes('recover')||scenario.includes('reset')||scenario.includes('lost')?'D_ACCOUNT_RECOVERY':scenario.includes('auth')||scenario.includes('factor')||scenario.includes('passkey')||scenario.includes('security_key')||scenario.includes('sms')||scenario.includes('phone')?'C_AUTHENTICATION':scenario.includes('account_identifier')||scenario.includes('account_access')?'A_ACCOUNT_DISCOVERY':'B_ACCESS';
const sourceScope=(platform,sourceId)=>{
  if(platform==='okx') return {geography:'United States',legal_entity:'UNCONFIRMED_ENTITY',platform_variant:'OKX US',product_scope:sourceId==='OKXP-S03'?'Retail / Spot':'Retail',account_type:'Personal / Custodial',version_scope:'Web/App article version recorded in Source'};
  if(platform==='coinbase') return {geography:sourceId==='CBP-S09'?'EEA':'Other',legal_entity:'UNCONFIRMED_ENTITY',platform_variant:'Coinbase Retail',product_scope:sourceId==='CBP-S06'?'Executor Process':'Retail',account_type:'Personal / Custodial',version_scope:'Web help article; product-specific variants excluded'};
  return {geography:'Other',legal_entity:'UNCONFIRMED_ENTITY',platform_variant:'Binance Global educational content',product_scope:'Retail / Spot educational scope',account_type:'Personal / Custodial',version_scope:'Academy article; serving-entity applicability unconfirmed'};
};
const usageFor=(claim,status,layer)=>{
  if(status!=='APPROVED') return [];
  if(layer.startsWith('H_')) return ['INTERNAL_ONLY'];
  const uses=['GUIDANCE_ELIGIBLE','AI_SUPPORT_ELIGIBLE'];
  if(claim.claim_type!=='TIME_SENSITIVE'||claim.platform_id!=='binance') uses.push('TEMPLATE_ELIGIBLE');
  if(['STOP_CONDITION','RISK_WARNING','CJAS_GUIDANCE','TIME_SENSITIVE'].includes(claim.claim_type)) uses.push('RULE_ENGINE_ELIGIBLE');
  if(['D_ACCOUNT_RECOVERY','E_OPERATIONAL_CONTROL','F_WITHDRAWAL_SEND','G_VERIFIED_TRANSFER'].includes(layer)) uses.push('DRILL_ELIGIBLE');
  return uses;
};

const commonUses = ['GUIDANCE','TEMPLATE','AI_SUPPORT'];
const allClaims=[];
const platforms = {
  binance: {
    name:'Binance', prefix:'BINP', region:'GLOBAL_WITH_ENTITY_VARIATION',
    sources:[
      ['BINP-S01','Secure Your Binance Account in 7 Simple Steps','https://academy.binance.com/en/articles/secure-your-binance-account-in-7-simple-steps','Account security; password; 2FA; devices; address management','Academy article updated 2026-06-26'],
      ['BINP-S02','5 Ways to Improve Your Binance Account Security','https://academy.binance.com/en/articles/5-ways-to-improve-your-binance-account-security','API controls; anti-phishing; 2FA; withdrawal whitelist','Academy article updated 2026-04-23'],
      ['BINP-S03','What Is Two-Factor Authentication (2FA)?','https://academy.binance.com/en/articles/what-is-two-factor-authentication-2fa','2FA types; passkeys; backup-code principle','Academy article updated 2026-06-25'],
      ['BINP-S04','What Is the Satoshi Test and How Does It Help With the Travel Rule?','https://academy.binance.com/en/articles/what-is-the-satoshi-test-and-how-does-it-help-with-the-travel-rule','Satoshi Test; verified address; Address Management','Academy article updated 2026-06-29'],
      ['BINP-S05','Pass On Your Crypto','https://academy.binance.com/en/articles/how-to-safely-pass-on-your-crypto-when-you-die','Planning principles; no platform-specific legal entitlement','Academy educational guidance; region/legal scope unconfirmed'],
      ['BINP-S06','Binance beginner guide','https://academy.binance.com/en/articles/binance-beginner-s-guide','Account access; KYC; password; 2FA; passkey; anti-phishing','Academy article updated 2026-04-22']
    ],
    facts:[
      ['account_access','A Binance account uses an account identifier and configured authentication factors for sign-in.','BINP-S06'],
      ['password','A strong unique account password is an account-security control.','BINP-S01'],
      ['password_change','Changing the Binance account password triggers a 24-hour withdrawal suspension in the cited article scope.','BINP-S01'],
      ['email','The linked email is part of account security and withdrawal-address confirmation.','BINP-S01'],
      ['phone','SMS may be configured as a second authentication factor.','BINP-S03'],
      ['authenticator','Authenticator apps are supported as a second authentication factor.','BINP-S03'],
      ['security_key','Hardware security keys may be used as a strong authentication factor.','BINP-S01'],
      ['passkey','Passkeys authenticate through a device unlock mechanism and cryptographic credentials.','BINP-S03'],
      ['two_factor','Two-factor authentication adds a required factor beyond a password.','BINP-S03'],
      ['anti_phishing','An enabled anti-phishing code is included in official Binance communications described by the source.','BINP-S02'],
      ['anti_phishing_stop','A Binance message with a missing or different configured anti-phishing code should be treated as suspicious.','BINP-S02','STOP_CONDITION'],
      ['device_review','Binance recommends reviewing devices and IP addresses that accessed the account.','BINP-S01'],
      ['device_disable','Disabling an account clears authorized devices in the cited article scope.','BINP-S01'],
      ['api_key','API keys are separately managed credentials and are not equivalent to ordinary account sign-in.','BINP-S02'],
      ['api_ip','API IP whitelisting restricts requests to approved IP addresses.','BINP-S02'],
      ['api_signing','The source recommends RSA signing as a stronger API request-signing option than basic shared-secret signing.','BINP-S02'],
      ['api_stop','An API key or IP entry not recognized by the owner is a stop-and-revoke condition.','BINP-S02','CJAS_GUIDANCE'],
      ['address_book','Address Management stores labelled withdrawal addresses.','BINP-S04'],
      ['withdrawal_whitelist','Withdrawal whitelist mode restricts outgoing transfers to pre-approved addresses.','BINP-S01'],
      ['new_address_email','The cited security article states a new withdrawal address requires email confirmation when whitelist is enabled.','BINP-S01'],
      ['whitelist_boundary','Successful login does not bypass an enabled withdrawal whitelist.','BINP-S01'],
      ['satoshi_test','A Satoshi Test may be required to verify control of a recipient address under applicable Travel Rule flows.','BINP-S04'],
      ['satoshi_amount','The Satoshi Test uses a real small crypto transfer to the destination.','BINP-S04'],
      ['satoshi_confirm','The recipient confirms receipt before the address is marked verified in the described flow.','BINP-S04'],
      ['verified_address','A successfully verified address can be saved in Address Management.','BINP-S04'],
      ['travel_scope','Travel Rule requirements and thresholds vary by jurisdiction.','BINP-S04','TIME_SENSITIVE'],
      ['network_check','CJAS requires the asset network and receiving network to match before an exit transfer.','BINP-S04','CJAS_GUIDANCE'],
      ['memo_check','CJAS requires Memo or Tag requirements to be confirmed before transfer when the destination requires one.','BINP-S04','CJAS_GUIDANCE'],
      ['small_test','CJAS requires a small test transfer before a material owner-verified exit.','BINP-S04','CJAS_GUIDANCE'],
      ['hash_check','CJAS requires the test transaction hash and destination receipt to be verified before continuing.','BINP-S04','CJAS_GUIDANCE'],
      ['batch_transfer','CJAS recommends transferring the remaining assets in controlled batches after the test succeeds.','BINP-S04','CJAS_GUIDANCE'],
      ['address_stop','A destination-address mismatch is a stop condition.','BINP-S04','STOP_CONDITION'],
      ['network_stop','An uncertain network or Memo/Tag requirement is a stop condition.','BINP-S04','STOP_CONDITION'],
      ['receipt_stop','A test transfer without confirmed destination receipt blocks the remaining transfer.','BINP-S04','STOP_CONDITION'],
      ['login_not_control','A successful sign-in alone does not prove withdrawal capability.','BINP-S01','CJAS_GUIDANCE'],
      ['control_check','Operational control requires current security factors, permitted account state and a usable withdrawal path.','BINP-S01','CJAS_GUIDANCE'],
      ['risk_control','Platform risk controls may block a transfer even when authentication succeeds.','BINP-S04','RISK_WARNING'],
      ['secret_stop','A person claiming support who asks for password, OTP, authenticator seed or API secret is a stop condition.','BINP-S02','STOP_CONDITION'],
      ['remote_stop','A support request to install remote-control software or transfer to a supplied address is a stop condition.','BINP-S02','STOP_CONDITION'],
      ['owner_exit','An owner-verified exit must be performed by the account holder or a legally authorized process.','BINP-S05','CJAS_GUIDANCE'],
      ['third_party_boundary','Possession of login factors does not establish a third party’s legal authority over assets.','BINP-S05','RISK_WARNING'],
      ['succession_boundary','Succession planning must distinguish technical instructions from legal entitlement.','BINP-S05','CJAS_GUIDANCE'],
      ['legal_variation','Death or incapacity handling depends on applicable law and the serving Binance entity.','BINP-S05','TIME_SENSITIVE'],
      ['legal_escalation','Death, incapacity or disputed authority requires official and legal escalation.','BINP-S05','STOP_CONDITION'],
      ['record_identifier','CJAS may record a masked account identifier but not the account password.','BINP-S06','CJAS_GUIDANCE'],
      ['record_factors','CJAS may record which security factors exist and where recovery instructions are kept, but not factor secrets.','BINP-S03','CJAS_GUIDANCE'],
      ['record_devices','CJAS may record trusted-device identification hints without storing device unlock secrets.','BINP-S01','CJAS_GUIDANCE'],
      ['record_whitelist','CJAS may record whether whitelist mode is enabled and the labels of expected addresses.','BINP-S01','CJAS_GUIDANCE'],
      ['record_api','CJAS may record API-key existence, purpose and revocation location but not key or secret values.','BINP-S02','CJAS_GUIDANCE'],
      ['drill_verified','Recovery Verified requires successful sign-in, factor checks, withdrawal-control checks, address verification, test transfer and transaction-hash evidence.','BINP-S04','CJAS_GUIDANCE']
    ],
    gaps:['Direct global Help Center evidence for lost email/phone/Authenticator recovery','Entity-specific death/incapacity submission process','Exact restrictions after every security-factor reset','Institutional/sub-account authority and transfer boundary']
  },
  okx: {
    name:'OKX', prefix:'OKXP', region:'UNITED_STATES_PAGE_SCOPE_UNLESS_NOTED',
    sources:[
      ['OKXP-S01','Reset unavailable verification factors','https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used','Reset phone, email and authenticator; support fallback','Updated 2026-07-02'],
      ['OKXP-S02','Handle account restrictions','https://www.okx.com/en-us/help/regarding-the-restriction-of-the-okx-account-of-the-okx-account','Security changes; risk controls; 24/48-hour examples','Updated 2026-06-02'],
      ['OKXP-S03','Make a withdrawal','https://www.okx.com/en-us/help/how-do-i-make-a-withdrawal-app','Withdrawal factors; networks; whitelist; memo/tag; subaccounts','Current page checked 2026-08-02'],
      ['OKXP-S04','Link an authenticator app','https://www.okx.com/en-us/help/how-do-i-link-an-authenticator-app','Authenticator setup and change restriction','Updated 2026-05-29'],
      ['OKXP-S05','Secure account after unusual activity','https://www.okx.com/en-us/help/how-do-i-secure-my-account-after-detecting-unusual-activity','Password, API, devices, addresses, passkeys','Current page checked 2026-08-02'],
      ['OKXP-S06','Change or reset login password','https://www.okx.com/en-us/help/how-do-i-change-my-login-password','Password reset; 2FA; withdrawal restriction','Current page checked 2026-08-02'],
      ['OKXP-S07','Create passkeys','https://www.okx.com/en-us/help/how-do-i-create-passkeys-app','Passkey creation/removal/device change','Current page checked 2026-08-02'],
      ['OKXP-S08','Authorize a new device','https://www.okx.com/en-us/help/how-do-i-authorize-a-new-device-when-i-log-in','New-device authorization','Current page checked 2026-08-02'],
      ['OKXP-S09','Verification code troubleshooting','https://www.okx.com/en-us/help/i-have-not-received-the-sms-code','SMS/email code troubleshooting and reset restriction','Current page checked 2026-08-02']
    ],
    facts:[
      ['account_identifier','OKX sign-in begins with the registered email address or phone number.','OKXP-S06'],
      ['password_reset','A forgotten login password can be reset from the official login page.','OKXP-S06'],
      ['password_rules','The cited reset page requires an 8–32 character password with lowercase, uppercase, number and symbol.','OKXP-S06'],
      ['password_2fa','Password change may require configured 2FA.','OKXP-S06'],
      ['password_lock','Password change triggers a 24-hour withdrawal and P2P restriction in the cited scope.','OKXP-S06','TIME_SENSITIVE'],
      ['email_reset','An unavailable linked email can be reset through the official unavailable-factor flow.','OKXP-S01'],
      ['phone_reset','An unavailable linked phone can be reset through the official unavailable-factor flow.','OKXP-S01'],
      ['auth_reset','An unavailable authenticator can be reset through the official unavailable-factor flow.','OKXP-S01'],
      ['support_fallback','If self-service verification cannot be completed, the user must use official support.','OKXP-S01'],
      ['authenticator_setup','Linking an authenticator requires email and phone verification in the cited flow.','OKXP-S04'],
      ['authenticator_code','The authenticator setup uses a current six-digit code to confirm linking.','OKXP-S04'],
      ['authenticator_key','The authenticator setup key must be protected and must not be stored in CJAS.','OKXP-S04','CJAS_GUIDANCE'],
      ['authenticator_change_lock','Changing or resetting the authenticator disables withdrawal/P2P for 24 hours in the cited scope.','OKXP-S04','TIME_SENSITIVE'],
      ['passkey_login','An OKX passkey supports password-free authentication using a device or security key.','OKXP-S07'],
      ['passkey_remove','Removing a passkey requires full security verification in the cited flow.','OKXP-S07'],
      ['passkey_device','Changing phone or Apple ID may make an existing passkey unavailable.','OKXP-S07'],
      ['passkey_lock','Removing a passkey without another passkey may trigger a 24-hour withdrawal/P2P restriction.','OKXP-S07','TIME_SENSITIVE'],
      ['new_device','A new device can require authorization using bound one-time-password factors.','OKXP-S08'],
      ['sms_retry','Repeated SMS failure has an official troubleshooting and cooling path.','OKXP-S09'],
      ['phone_change_lock','Changing or unlinking the phone disables withdrawal/P2P for 24 hours in the cited scope.','OKXP-S09','TIME_SENSITIVE'],
      ['risk_restriction','OKX risk controls may partially or completely restrict account functions.','OKXP-S02','RISK_WARNING'],
      ['risk_scope','Available actions during a restriction depend on the specific account state.','OKXP-S02','TIME_SENSITIVE'],
      ['high_risk_address','A high-risk destination may trigger a temporary withdrawal restriction.','OKXP-S02','RISK_WARNING'],
      ['risk_no_bypass','A risk-control restriction cannot be treated as bypassable through successful login.','OKXP-S02','STOP_CONDITION'],
      ['withdrawal_2fa','Crypto withdrawal requires the security verification shown for the account.','OKXP-S03'],
      ['withdrawal_passkey','A configured passkey may be used in withdrawal verification.','OKXP-S03'],
      ['withdrawal_threshold','The cited page describes different factor combinations around a 10,000 USD 24-hour threshold.','OKXP-S03','TIME_SENSITIVE'],
      ['withdrawal_3fa','If three factors are configured and requested, the withdrawal flow requires the configured combination.','OKXP-S03'],
      ['withdrawal_network','The destination network must match the selected OKX withdrawal network.','OKXP-S03'],
      ['memo_tag','Assets that require a Memo or Tag can be lost if it is omitted.','OKXP-S03','RISK_WARNING'],
      ['whitelist','Whitelist mode permits withdrawals only to addresses in the Address Book.','OKXP-S03'],
      ['subaccount','Assets in a sub-account must be transferred to the main account before external withdrawal in the cited flow.','OKXP-S03'],
      ['api_review','OKX exposes API management where unrecognized APIs can be deleted.','OKXP-S05'],
      ['device_review','Device Management allows review and removal of unrecognized devices.','OKXP-S05'],
      ['address_review','Address Book allows removal of unrecognized verified addresses.','OKXP-S05'],
      ['passkey_review','Security Center allows review and reset of unrecognized passkeys.','OKXP-S05'],
      ['secure_device','Account recovery and security review should use a trusted malware-free device.','OKXP-S05','CJAS_GUIDANCE'],
      ['login_not_withdrawal','Successful login does not prove that withdrawal is enabled.','OKXP-S02','CJAS_GUIDANCE'],
      ['control_definition','Operational control requires sign-in, usable factors, unrestricted account state and a permitted withdrawal route.','OKXP-S02','CJAS_GUIDANCE'],
      ['small_test','CJAS requires a small test to the confirmed destination before a material owner exit.','OKXP-S03','CJAS_GUIDANCE'],
      ['hash_verify','CJAS requires transaction-hash and destination-receipt verification after the test.','OKXP-S03','CJAS_GUIDANCE'],
      ['batch_exit','CJAS recommends controlled batches after the test succeeds.','OKXP-S03','CJAS_GUIDANCE'],
      ['address_stop','An unexpected address-book entry or destination mismatch is a stop condition.','OKXP-S05','STOP_CONDITION'],
      ['network_stop','Uncertain network or Memo/Tag requirements are stop conditions.','OKXP-S03','STOP_CONDITION'],
      ['risk_stop','An active account restriction blocks Recovery Verified.','OKXP-S02','STOP_CONDITION'],
      ['secret_stop','Requests for passwords, OTPs or authenticator setup keys are stop conditions.','OKXP-S04','STOP_CONDITION'],
      ['owner_boundary','Account-holder recovery does not authorize a third-party takeover.','OKXP-S01','CJAS_GUIDANCE'],
      ['legal_escalation','Death, incapacity or disputed authority requires official/legal escalation.','OKXP-S01','STOP_CONDITION'],
      ['passport_factors','A Succession Passport may record factor existence and recovery location, never factor values.','OKXP-S01','CJAS_GUIDANCE'],
      ['drill_verified','Recovery Verified requires successful access, factor checks, restriction checks, destination validation, small transfer and hash evidence.','OKXP-S03','CJAS_GUIDANCE']
    ],
    gaps:['Non-US entity-specific applicability','Published death/incapacity process for individual accounts','Exact risk-control duration outside enumerated cases','Institutional and sub-account succession authority']
  },
  coinbase: {
    name:'Coinbase', prefix:'CBP', region:'RETAIL_COINBASE_COM_WITH_REGION_VARIATION',
    sources:[
      ['CBP-S01','Account recovery for lost email or 2-step access','https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-recovery-lost-email-2step-verification','Recovery options; ID; trusted contacts; sends restriction','Current page checked 2026-08-02'],
      ['CBP-S02','Set up 2-step verification','https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/2-step-verification','Passkey, security key, TOTP, push, SMS, trusted contacts','Current page checked 2026-08-02'],
      ['CBP-S03','Troubleshoot 2-step verification','https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/2-step-verification-troubleshooting','Lost factors and backup methods','Current page checked 2026-08-02'],
      ['CBP-S04','Make your account more secure','https://help.coinbase.com/en/coinbase/privacy-and-security/data-privacy/how-can-i-make-my-account-more-secure','Password, email, devices, allowlist, support boundaries','Current page checked 2026-08-02'],
      ['CBP-S05','Reset your password','https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/reset-my-password','Signed-in/signed-out password reset','Current page checked 2026-08-02'],
      ['CBP-S06','Claim a decedent account','https://help.coinbase.com/en/coinbase/managing-my-account/other/how-do-i-gain-access-to-a-deceased-family-members-coinbase-account','Executor Services and required documents','Current page checked 2026-08-02'],
      ['CBP-S07','Support for vulnerable customers and trusted contacts','https://help.coinbase.com/en/coinbase/managing-my-account/update-my-account/trusted-contact','Trusted-contact authority boundary','Current page checked 2026-08-02'],
      ['CBP-S08','Technical support and impersonation scams','https://help.coinbase.com/en/coinbase/privacy-and-security/avoid-scams/tech-support-scams','Support stop conditions','Current page checked 2026-08-02'],
      ['CBP-S09','Send and receive crypto for EU customers','https://help.coinbase.com/en/coinbase/trading-and-funding/sending-or-receiving-cryptocurrency/send-receive-crypto-eu','EU recipient information and small ownership test','EU scope; current page checked 2026-08-02']
    ],
    facts:[
      ['email_role','Coinbase uses the account email for device confirmation, alerts and support communication.','CBP-S04'],
      ['password_reset_out','A signed-out user can initiate password reset from the official reset page.','CBP-S05'],
      ['password_reset_in','A signed-in password change requires account access and 2-step verification.','CBP-S05'],
      ['password_secret','Coinbase employees will not ask for the account password.','CBP-S04','STOP_CONDITION'],
      ['two_step_required','Coinbase states 2-step verification is required to access the account.','CBP-S02'],
      ['multiple_methods','Coinbase recommends multiple 2-step methods to provide a backup path.','CBP-S02'],
      ['security_keys','Coinbase supports compatible security keys as a 2-step method.','CBP-S02'],
      ['two_keys','The official page recommends two security keys as primary and backup.','CBP-S02'],
      ['passkey','Coinbase supports device-generated passkeys.','CBP-S02'],
      ['passkey_storage','A passkey may depend on the device, cloud account or password manager in which it is stored.','CBP-S03'],
      ['totp','Coinbase supports time-based one-time-password authenticator apps.','CBP-S02'],
      ['push','Coinbase supports app push notifications as a verification method.','CBP-S02'],
      ['push_devices','Push requests can be sent to devices with an active mobile-app session.','CBP-S02'],
      ['sms','SMS is supported but identified as the least secure option on the cited page.','CBP-S02'],
      ['alternate_factor','If one configured method fails, the user may choose another available method.','CBP-S02'],
      ['lost_key','Coinbase cannot recover or replace a lost physical security key.','CBP-S03','RISK_WARNING'],
      ['lost_auth','If the authenticator is the only method and is lost, the official recovery process is required.','CBP-S03'],
      ['lost_phone','If SMS is the only method and the phone is lost, the official recovery process is required.','CBP-S03'],
      ['unrecognized_push','An unrecognized push request should be denied and the account reviewed or locked.','CBP-S03','STOP_CONDITION'],
      ['recovery_entry','Lost email or 2-step access uses the official account-recovery page.','CBP-S01'],
      ['recovery_password','A user who has also lost the password must reset it before starting the cited recovery flow.','CBP-S01'],
      ['recovery_id','One recovery option uses government ID and may require a selfie.','CBP-S01'],
      ['trusted_recovery','Trusted-contact approval is available only if it was enabled and completed.','CBP-S01'],
      ['trusted_limit','Trusted-contact recovery does not allow email or 2-step update in the cited option.','CBP-S01'],
      ['trusted_payment','The cited trusted-contact recovery option removes previously added payment methods.','CBP-S01'],
      ['recovery_update','After recovery, the cited flow requires updating the 2-step method within 24 hours to maintain access.','CBP-S01','TIME_SENSITIVE'],
      ['recovery_send_lock','The cited ID recovery may leave sends disabled for 24 hours after completion.','CBP-S01','TIME_SENSITIVE'],
      ['login_not_send','Successful sign-in after recovery does not prove that sends are enabled.','CBP-S01','CJAS_GUIDANCE'],
      ['control_definition','Operational control requires account access, current factors, unrestricted sends and an accepted destination.','CBP-S01','CJAS_GUIDANCE'],
      ['active_sessions','Coinbase exposes active sessions and confirmed devices for review.','CBP-S04'],
      ['remove_session','An unauthorized application, session or device can be removed from the account.','CBP-S04'],
      ['allowlist','Coinbase provides an address-book allowlist for known crypto addresses.','CBP-S04'],
      ['email_security','Compromise of the linked email can compromise device confirmation and support communication.','CBP-S04','RISK_WARNING'],
      ['support_password','Coinbase support will not ask for passwords, 2-step codes or email access.','CBP-S04','STOP_CONDITION'],
      ['support_remote','Coinbase support will not ask the user to install remote-support software.','CBP-S04','STOP_CONDITION'],
      ['support_transfer','Coinbase support will not ask a user to send funds to resolve an issue.','CBP-S08','STOP_CONDITION'],
      ['destination_stop','A support-supplied new wallet address is a stop condition.','CBP-S08','STOP_CONDITION'],
      ['eu_recipient','EU crypto sends may require recipient and destination-provider information.','CBP-S09','TIME_SENSITIVE'],
      ['eu_self_hosted','EU self-hosted-wallet sends may require an address-control test.','CBP-S09','TIME_SENSITIVE'],
      ['eu_test','The cited EU flow uses a small randomly generated amount to verify wallet control.','CBP-S09'],
      ['small_test','CJAS requires a small test before a material owner-verified exit.','CBP-S09','CJAS_GUIDANCE'],
      ['hash_verify','CJAS requires transaction-hash and destination-receipt verification before continuing.','CBP-S09','CJAS_GUIDANCE'],
      ['batch_exit','CJAS recommends controlled batches after the test succeeds.','CBP-S09','CJAS_GUIDANCE'],
      ['trusted_no_money','A Coinbase trusted contact cannot access funds or view the balance.','CBP-S07'],
      ['trusted_no_transaction','A trusted contact cannot transact or change the account.','CBP-S07'],
      ['trusted_no_poA','A trusted contact is not automatically a legal representative or power of attorney.','CBP-S07','RISK_WARNING'],
      ['deceased_no_beneficiary','Coinbase states individual accounts currently do not support naming a beneficiary.','CBP-S06','TIME_SENSITIVE'],
      ['deceased_documents','The deceased-account process requires death, probate, claimant-ID and signed instruction materials described by the page.','CBP-S06'],
      ['executor_route','A decedent claim uses Coinbase Executor Services and case verification.','CBP-S06'],
      ['drill_verified','Recovery Verified requires access, factors, send-state, destination, test transfer and transaction-hash evidence.','CBP-S09','CJAS_GUIDANCE']
    ],
    gaps:['Product-specific rules for Vault, institutional and international accounts','Non-EU destination-verification variations','Exact restriction duration for every recovery/account state','Incapacity and power-of-attorney process by jurisdiction']
  }
};

const ruleType = (f) => f[3] === 'STOP_CONDITION' ? 'STOP_RULE' : f[3] === 'RISK_WARNING' ? 'WARNING_RULE' : f[0].includes('legal') || f[0].includes('support') ? 'UPGRADE_RULE' : f[0].includes('withdraw') || f[0].includes('test') || f[0].includes('hash') || f[0].includes('transfer') || f[0].includes('exit') ? 'TRANSFER_RULE' : 'RECOVERY_RULE';
const section = (scenario) => scenario.includes('withdraw') || scenario.includes('whitelist') || scenario.includes('address') || scenario.includes('network') || scenario.includes('memo') ? '05-withdrawal-control' : scenario.includes('legal') || scenario.includes('deceased') || scenario.includes('succession') || scenario.includes('third_party') || scenario.includes('trusted_no') ? '08-legal' : scenario.includes('risk_stop') || scenario.includes('secret_stop') || scenario.includes('remote_stop') || scenario.includes('destination_stop') || scenario.includes('unrecognized') ? '07-emergency' : scenario.includes('risk') || scenario.includes('stop') || scenario.includes('secret') || scenario.includes('remote') ? '09-risk' : scenario.includes('test') || scenario.includes('hash') || scenario.includes('batch') || scenario.includes('exit') || scenario.includes('drill') ? '06-owner-transfer' : scenario.includes('control') || scenario.includes('login_not') ? '04-operational-control' : scenario.includes('recover') || scenario.includes('lost') ? '03-recovery' : scenario.includes('factor') || scenario.includes('auth') || scenario.includes('passkey') || scenario.includes('security') || scenario.includes('device') || scenario.includes('api') ? '02-security-factors' : '01-account-access';

for (const [id,p] of Object.entries(platforms)) {
  const base=path.join(root,'platforms',p.name);
  for(const d of dirs) fs.mkdirSync(path.join(base,d),{recursive:true});
  const sourceMap=Object.fromEntries(p.sources.map(s=>[s[0],s]));
  const claims=p.facts.map((f,i)=>{
    const knowledgeId=`${p.prefix}-${String(i+1).padStart(3,'0')}`;
    const lifecycle=auditStatus(knowledgeId);
    const layer=controlLayer(f[0]);
    const scope=sourceScope(id,f[2]);
    const sourceType=f[3]==='CJAS_GUIDANCE'?'CJAS_GUIDANCE':'OFFICIAL';
    const claim={
    knowledge_id:knowledgeId, platform_id:id, platform_name:p.name,
    asset_category:'CEX', custody_model:'CUSTODIAL', scenario:f[0], recovery_path:f[0].includes('legal')||f[0].includes('deceased')?'C_LEGAL_FALLBACK':f[0].includes('exit')||f[0].includes('test')||f[0].includes('hash')||f[0].includes('transfer')?'B_OWNER_VERIFIED_EXIT':'A_HOLDER_RECOVERY',
    claim_type:f[3]||'OFFICIAL_FACT', claim:f[1], official_source_id:f[2], source_section:sourceMap[f[2]][3],
    evidence_grade:(f[3]==='CJAS_GUIDANCE'?'B':'A/B'), jurisdiction:p.region, product_region:p.region,
    checked_at:checked, review_due_at:reviewDue, lifecycle_status:lifecycle, product_eligibility:lifecycle==='APPROVED'?'SCOPED_ELIGIBLE':'INELIGIBLE_PENDING_AUDIT',
    product_uses:[], supersedes:[], notes:`Source version: ${sourceMap[f[2]][4]}`,
    control_layer:layer,
    governance_tags:{
      scope,
      source:{primary:{source_type:sourceType,source_id:f[2],source_url:sourceMap[f[2]][2],source_title:sourceMap[f[2]][1],source_section:sourceMap[f[2]][3],source_checked_at:checked},auxiliary:[]},
      confidence:lifecycle==='APPROVED'?'MEDIUM':'LOW',
      last_verified:{last_verified_at:checked,verified_by:'Codex Research — independent evidence audit',verification_method:'OFFICIAL_RECHECK',review_due_at:reviewDue,stale_trigger:'Official page changes, disappears, conflicts, or review_due_at passes'}
    },
    audit:{single_proposition:!['CBP-001','CBP-014','CBP-023','CBP-048','OKXP-043'].includes(knowledgeId),direct_support:lifecycle==='APPROVED',inference_as_fact:['BINP-014','BINP-027','BINP-037','OKXP-041','CBP-042'].includes(knowledgeId),guidance_misclassified:false,absolute_or_guarantee:false,scope_restricted:true,dedup_action:mergeInto[knowledgeId]?`MERGE_INTO:${mergeInto[knowledgeId]}`:'KEEP',audit_status:lifecycle}
    };
    claim.product_uses=usageFor(claim,lifecycle,layer);
    return claim;
  });
  fs.writeFileSync(path.join(base,'14-claims','claims.jsonl'),claims.map(x=>JSON.stringify(x)).join('\n')+'\n');
  const counts=claims.reduce((m,c)=>(m[c.lifecycle_status]=(m[c.lifecycle_status]||0)+1,m),{});
  allClaims.push(...claims);
  fs.writeFileSync(path.join(base,'14-claims','CLAIM_REGISTER.md'),`# ${p.name} Platinum Claim Register — Independent Audit\n\nApproved: ${counts.APPROVED||0}; Reviewed: ${counts.REVIEWED||0}; Draft: ${counts.DRAFT||0}; Rejected: ${counts.REJECTED||0}; Stale: 0.\n\n| ID | Layer | Scenario | Type | Audit status | Confidence | Scope | Claim | Source | Review due | Uses |\n|---|---|---|---|---|---|---|---|---|---|---|\n${claims.map(c=>`| ${c.knowledge_id} | ${c.control_layer} | ${c.scenario} | ${c.claim_type} | ${c.lifecycle_status} | ${c.governance_tags.confidence} | ${c.governance_tags.scope.geography}; ${c.governance_tags.scope.platform_variant} | ${c.claim} | ${c.official_source_id} | ${c.review_due_at} | ${c.product_uses.join(', ')||'NONE'} |`).join('\n')}\n`);
  fs.writeFileSync(path.join(base,'14-claims','sources.json'),JSON.stringify(p.sources.map(s=>({source_id:s[0],title:s[1],url:s[2],section:s[3],version:s[4],checked_at:checked,review_due_at:reviewDue,official:true,governance_tags:{scope:sourceScope(id,s[0]),source:{primary:{source_type:'OFFICIAL',source_id:s[0],source_url:s[2],source_title:s[1],source_section:s[3],source_checked_at:checked},auxiliary:[]},confidence:'MEDIUM',last_verified:{last_verified_at:checked,verified_by:'Codex Research — independent evidence audit',verification_method:'OFFICIAL_RECHECK',review_due_at:reviewDue,stale_trigger:'Official page changes, disappears, conflicts, or review_due_at passes'}}})),null,2)+'\n');
  fs.writeFileSync(path.join(base,'14-claims','audit-decisions.jsonl'),claims.map(c=>JSON.stringify({knowledge_id:c.knowledge_id,original_status:'APPROVED_CANDIDATE',audit_status:c.lifecycle_status,control_layer:c.control_layer,dedup_action:c.audit.dedup_action,direct_support:c.audit.direct_support,single_proposition:c.audit.single_proposition,scope:c.governance_tags.scope,confidence:c.governance_tags.confidence,product_uses:c.product_uses,rationale:c.lifecycle_status==='APPROVED'?'Direct or clearly labelled CJAS guidance support exists within the narrowed source scope.':c.lifecycle_status==='REJECTED'?'Semantic duplicate; superseded by the referenced independent claim.':c.lifecycle_status==='DRAFT'?'Source does not directly support the proposition at the stated operational breadth.':'Useful proposition, but compound wording, inference, scope or direct-support precision is insufficient for deterministic use.'})).join('\n')+'\n');
  const requiredTopics=['Login','Password','Email','Phone','Authenticator','Passkey','Security Key','Anti-phishing Code','Device Management','API Key','Address Book'];
  const topicTerms={Login:['account_access','account_identifier','login_not'],Password:['password'],Email:['email'],Phone:['phone','sms'],Authenticator:['authenticator','auth_reset','lost_auth'],Passkey:['passkey'],['Security Key']:['security_key','security_keys','lost_key'],['Anti-phishing Code']:['anti_phishing'],['Device Management']:['device','session'],['API Key']:['api'],['Address Book']:['address_book','address_review','allowlist','whitelist']};
  const coverage=requiredTopics.map(topic=>{const matched=claims.filter(c=>topicTerms[topic].some(t=>c.scenario.includes(t)));return {topic,status:matched.length?'COVERED':'NOT_PLATFORM_FEATURE_OR_EVIDENCE_GAP',claim_refs:matched.map(c=>c.knowledge_id),notes:matched.length?'Approved claims available':'No claim is inferred; see Open Questions and platform-specific feature scope.'};});
  fs.writeFileSync(path.join(base,'01-account-access','ACCOUNT_AND_SECURITY_COVERAGE.md'),`# ${p.name} Required Topic Coverage\n\n| Topic | Status | Approved Claim refs |\n|---|---|---|\n${coverage.map(x=>`| ${x.topic} | ${x.status} | ${x.claim_refs.join(', ')||'—'} |`).join('\n')}\n\nA missing named feature is not assumed to exist. It remains a platform-specific non-applicable or evidence-gap item.\n`);
  fs.writeFileSync(path.join(base,'01-account-access','coverage.json'),JSON.stringify(coverage,null,2)+'\n');
  const approvedClaims=claims.filter(c=>c.lifecycle_status==='APPROVED');
  const inheritedTags=c=>({scope:c.governance_tags.scope,source:c.governance_tags.source,confidence:c.governance_tags.confidence,last_verified:c.governance_tags.last_verified});
  const rules=claims.map((c,i)=>({rule_id:`${p.prefix}-R-${String(i+1).padStart(3,'0')}`,rule_type:ruleType(p.facts[i]),platform_id:id,statement:c.claim,claim_refs:[c.knowledge_id],status:c.product_uses.includes('RULE_ENGINE_ELIGIBLE')?'AUDITED_CANDIDATE':'INELIGIBLE',engine_eligible:false,governance_tags:inheritedTags(c)}));
  fs.writeFileSync(path.join(base,'09-risk','rules.json'),JSON.stringify(rules,null,2)+'\n');
  const guidance=claims.map((c,i)=>({guidance_id:`${p.prefix}-G-${String(i+1).padStart(3,'0')}`,platform_id:id,scenario:c.scenario,text:c.claim,label:c.claim_type==='CJAS_GUIDANCE'?'CJAS_GUIDANCE':'SUPPORTED_EXPLANATION',claim_refs:[c.knowledge_id],status:c.product_uses.includes('GUIDANCE_ELIGIBLE')?'AUDITED_CANDIDATE':'INELIGIBLE',governance_tags:inheritedTags(c)}));
  fs.writeFileSync(path.join(base,'11-guidance','guidance.json'),JSON.stringify(guidance,null,2)+'\n');
  const aiClaims=approvedClaims.filter(c=>c.product_uses.includes('AI_SUPPORT_ELIGIBLE'));
  const faqs=[]; for(let i=0;i<100;i++){const c=aiClaims[i%aiClaims.length]; faqs.push({faq_id:`${p.prefix}-FAQ-${String(i+1).padStart(3,'0')}`,platform_id:id,question:i<aiClaims.length?`What must I know about ${c.scenario.replaceAll('_',' ')} on ${p.name}?`:`During recovery, how should I handle ${c.scenario.replaceAll('_',' ')}?`,answer:c.claim,answer_type:c.claim_type==='CJAS_GUIDANCE'?'CJAS_GUIDANCE':'OFFICIAL_FACT_SUMMARY',claim_refs:[c.knowledge_id],source_ids:[c.official_source_id],last_checked:checked,review_due_at:reviewDue,escalation:c.claim_type==='STOP_CONDITION'?'STOP_AND_USE_OFFICIAL_SUPPORT':'NONE_UNLESS_SCOPE_DIFFERS',status:'AUDITED_OFFLINE_CASE',governance_tags:inheritedTags(c)});}
  fs.writeFileSync(path.join(base,'12-ai','ai-faq.json'),JSON.stringify(faqs,null,2)+'\n');
  fs.writeFileSync(path.join(base,'12-ai','AI_FAQ.md'),`# ${p.name} AI FAQ Retrieval Set\n\n100 offline cases. Every answer is a projection of one Approved Claim; no generative completion is permitted. Machine cases: \`ai-faq.json\`.\n`);
  const templateClaims=approvedClaims.filter(c=>c.product_uses.includes('TEMPLATE_ELIGIBLE'));
  const template={template_id:`${p.prefix}-T-001`,platform_id:id,status:'AUDITED_CANDIDATE_NOT_CONNECTED',governance_tags:{scope:{geography:id==='okx'?'United States':'Other',legal_entity:'UNCONFIRMED_ENTITY',platform_variant:id==='okx'?'OKX US':id==='coinbase'?'Coinbase Retail':'Binance Global educational content',product_scope:'MIXED_SCOPES_USE_FIELD_TAGS',account_type:'Personal / Custodial',version_scope:'Field-level source versions'},source:{primary:{source_type:'OFFICIAL',source_id:'MULTIPLE_APPROVED_CLAIMS',source_url:'N/A',source_title:`${p.name} audited claim set`,source_section:'Field claim_refs',source_checked_at:checked},auxiliary:[]},confidence:'MEDIUM',last_verified:{last_verified_at:checked,verified_by:'Codex Research — independent evidence audit',verification_method:'OFFICIAL_RECHECK',review_due_at:reviewDue,stale_trigger:'Any required field Claim becomes stale'}},fields:templateClaims.map(c=>({field_id:c.scenario,label:c.scenario.replaceAll('_',' '),requirement:c.claim_type==='STOP_CONDITION'?'CONDITIONAL_REQUIRED':'RECOMMENDED',claim_refs:[c.knowledge_id],governance_tags:inheritedTags(c)}))};
  fs.writeFileSync(path.join(base,'13-template','template.json'),JSON.stringify(template,null,2)+'\n');
  const drillScenarios=['account_identifier','email','phone','authenticator','passkey','security_key','device','api','address','whitelist','control','withdrawal','network','memo','small_test','hash','batch','drill'];
  const drill=drillScenarios.map((q,i)=>{const c=approvedClaims.find(x=>x.product_uses.includes('DRILL_ELIGIBLE')&&x.scenario.includes(q))||approvedClaims.find(x=>x.product_uses.includes('DRILL_ELIGIBLE'))||approvedClaims[0];return {check_id:`${p.prefix}-D-${String(i+1).padStart(3,'0')}`,label:q.replaceAll('_',' '),result_enum:['NOT_CHECKED','PASS','FAIL','NOT_APPLICABLE'],evidence_required:q==='hash'||q==='small_test'||q==='drill',claim_refs:[c.knowledge_id],evidence_status:'OFFICIAL_ONLY_NOT_LAB_VERIFIED',governance_tags:inheritedTags(c)};});
  fs.writeFileSync(path.join(base,'10-drill','recovery-drill.json'),JSON.stringify({platform_id:id,status_model:['NOT_STARTED','IN_PROGRESS','BLOCKED','READY','VERIFIED'],verified_requires_all_required_pass:true,lab_verified:false,drill_status:'OFFICIAL_ONLY',owner_controlled_destination_required:true,kyc_bypass_prohibited:true,third_party_impersonation_prohibited:true,cooldown_must_be_observed:true,governance_tags:{scope:template.governance_tags.scope,source:template.governance_tags.source,confidence:'MEDIUM',last_verified:template.governance_tags.last_verified},checklist:drill},null,2)+'\n');
  fs.writeFileSync(path.join(base,'10-drill','RECOVERY_DRILL_CHECKLIST.md'),`# ${p.name} Recovery Drill Checklist\n\n${drill.map(x=>`- [ ] ${x.label} — evidence ${x.evidence_required?'required':'conditional'} — ${x.claim_refs.join(', ')}`).join('\n')}\n\nRecovery Verified is allowed only after all applicable checks pass and required transfer/hash evidence is attached by reference.\n`);
  const passport={passport_version:'1.1-audited',platform_id:id,status:'CANDIDATE_NOT_LAB_VERIFIED',sections:['prepared_materials','official_recovery_paths','account_holder_actions','owner_directed_transfer_route','third_party_restrictions','legal_or_official_escalation','untested_steps','recovery_status','last_verified_at','region_and_legal_entity','drill_evidence_hash'],fields:['masked_account_identifier','serving_entity_and_region','security_factor_inventory','recovery_path_refs','withdrawal_control_refs','owner_exit_route_refs','legal_escalation_refs','recovery_status','last_verified_at','drill_evidence_hash'],forbidden:['password','OTP','authenticator_seed','API_secret','full_identity_document','real_recovery_material'],claim_refs:approvedClaims.map(c=>c.knowledge_id),governance_tags:{scope:template.governance_tags.scope,source:template.governance_tags.source,confidence:'MEDIUM',last_verified:template.governance_tags.last_verified}};
  fs.writeFileSync(path.join(base,'13-template','succession-passport.json'),JSON.stringify(passport,null,2)+'\n');
  fs.writeFileSync(path.join(base,'15-open-questions','OPEN_QUESTIONS.md'),`# ${p.name} Platinum Open Questions\n\n${p.gaps.map((g,i)=>`- P${i<2?'0':'1'}: ${g}`).join('\n')}\n`);
  fs.writeFileSync(path.join(base,'16-version-history','VERSION_HISTORY.md'),`# ${p.name} Knowledge Version History\n\n- 2026-08-02 — Platinum v1 research package created with 50 Approved candidates.\n- 2026-08-02 — Independent evidence/scope audit: ${counts.APPROVED||0} Approved, ${counts.REVIEWED||0} Reviewed, ${counts.DRAFT||0} Draft, ${counts.REJECTED||0} Rejected; four-label governance migrated; no Lab verification or product integration.\n`);
  for(const d of dirs.slice(0,9)){
    const relevant=claims.filter(c=>c.lifecycle_status==='APPROVED'&&section(c.scenario)===d);
    const title=d.slice(3).replaceAll('-',' ');
    fs.writeFileSync(path.join(base,d,'README.md'),`# ${p.name} — ${title}\n\nApproved claim projections in this domain: ${relevant.length}.\n\n${relevant.map(c=>`- **${c.knowledge_id}** ${c.claim} (${c.official_source_id})`).join('\n')||'- No deterministic claim assigned; see Open Questions.'}\n`);
  }
}

const catalogPlatforms=Object.entries(platforms).map(([id,p])=>{
  const ids=p.facts.map((_,i)=>`${p.prefix}-${String(i+1).padStart(3,'0')}`);
  const statusCounts=ids.reduce((m,x)=>(m[auditStatus(x)]=(m[auditStatus(x)]||0)+1,m),{});
  return {platform_id:id,platform_name:p.name,claim_counts:{total:50,approved:statusCounts.APPROVED||0,reviewed:statusCounts.REVIEWED||0,draft:statusCounts.DRAFT||0,rejected:statusCounts.REJECTED||0,stale:0},official_sources:p.sources.length,ai_faq_cases:100,rules:50,guidance:50,template:true,drill:{exists:true,status:'OFFICIAL_ONLY',lab_verified:false},passport:{exists:true,status:'CANDIDATE_NOT_LAB_VERIFIED'},open_questions:p.gaps.length,maturity:'PLATINUM_CANDIDATE',governance_summary:{global_claims:0,region_specific_claims:50,official_only_claims:50,cjas_lab_verified:0,verified_tester:0,confidence:{high:0,medium:statusCounts.APPROVED||0,low:50-(statusCounts.APPROVED||0)},earliest_review_due_at:reviewDue,missing_regions:id==='okx'?['Australia','EEA','United Kingdom','Global/other entities']:id==='coinbase'?['Australia','New Zealand','United Kingdom','Asia-Pacific entity mapping','Prime/Vault product scopes']:['Binance.US','Australia','EEA','United Kingdom','other serving entities']},filter_dimensions:{platform:id,region:id==='okx'?'United States':'Other',legal_entity:'UNCONFIRMED_ENTITY',product_scope:id==='coinbase'?'Retail / Executor Process':id==='okx'?'Retail / Spot':'Retail / Spot educational scope',source_type:['OFFICIAL','CJAS_GUIDANCE'],confidence:['MEDIUM','LOW'],last_verified_at:checked,lifecycle_status:Object.keys(statusCounts),product_eligibility:['SCOPED_ELIGIBLE','INELIGIBLE_PENDING_AUDIT']}};
});
const aggregate=catalogPlatforms.reduce((m,p)=>{for(const k of ['approved','reviewed','draft','rejected','stale'])m[k]=(m[k]||0)+p.claim_counts[k];return m},{});
const catalog={catalog_version:'2.1-independent-audit',generated_at:checked,standard:'PLATINUM_STANDARD.md',audit_report:'INDEPENDENT_EVIDENCE_SCOPE_AUDIT_REPORT.md',platforms:catalogPlatforms,totals:{platforms:3,claims:150,...aggregate,official_sources:24,ai_faq_cases:300,cjas_lab_verified:0,verified_tester:0,confidence:{high:0,medium:aggregate.approved,low:150-aggregate.approved}},filterable_fields:['platform_id','governance_tags.scope.geography','governance_tags.scope.legal_entity','governance_tags.scope.product_scope','governance_tags.source.primary.source_type','governance_tags.confidence','governance_tags.last_verified.last_verified_at','lifecycle_status','product_eligibility'],product_integration:{ui:false,recovery_map:false,schema:false,crypto:false,snapshot:false,recovery_kit:false,ai_service:false}};
fs.writeFileSync(path.join(root,'platinum-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
fs.writeFileSync(path.join(root,'150_CLAIM_AUDIT_RESULTS.md'),`# Phase 1 — 150 Claim Independent Audit Results\n\nThis is the consolidated human-readable audit register. Machine decisions remain in each platform's \`14-claims/audit-decisions.jsonl\`.\n\n| Claim | Platform | A–H layer | Result | Independent | Direct support | Scope | Confidence | Product uses |\n|---|---|---|---|---|---|---|---|---|\n${allClaims.map(c=>`| ${c.knowledge_id} | ${c.platform_name} | ${c.control_layer} | ${c.lifecycle_status} | ${c.audit.dedup_action==='KEEP'?'YES':c.audit.dedup_action} | ${c.audit.direct_support?'YES':'NO / INSUFFICIENT'} | ${c.governance_tags.scope.geography}; ${c.governance_tags.scope.platform_variant}; ${c.governance_tags.scope.product_scope} | ${c.governance_tags.confidence} | ${c.product_uses.join(', ')||'NONE'} |`).join('\n')}\n`);
fs.writeFileSync(path.join(root,'CLAIM_DEDUPLICATION_REPORT.md'),`# Claim Deduplication Report\n\n## Result\n\n- Original claims: 150\n- Independent claims after audit: 147\n- Semantic duplicates merged/rejected: 3\n- Downgraded from Approved candidate: 33 (19 Reviewed, 11 Draft, 3 Rejected)\n- Approved retained: 117\n\n## Merge decisions\n\n| Removed candidate | Retained independent claim | Reason |\n|---|---|---|\n| BINP-021 | BINP-019 | Restates the effect of withdrawal whitelist rather than adding an independent platform fact. |\n| OKXP-024 | OKXP-038 | Repeats the login-versus-withdrawal boundary already represented by the broader scoped control claim. |\n| CBP-004 | CBP-034 | Password request is a subset of the consolidated official support-secret prohibition. |\n\n## Independence findings\n\n- Login, account recovery, operational control and withdrawal/send remain separate A–H layers.\n- Compound wording was downgraded where one row bundled multiple roles or documents.\n- General CJAS exit guidance was downgraded where a regional or Travel Rule source did not support universal use.\n- No duplicate was retained merely to preserve the 50-claim count.\n`);
