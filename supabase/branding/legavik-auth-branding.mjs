const BRAND='LEGAVIK';
const TAGLINE='Digital Asset Recovery & Legacy';
const CANONICAL_ORIGIN='https://sixtrees778899-stack.github.io';
const CANONICAL_BASE=`${CANONICAL_ORIGIN}/SKREK-auth-test/web`;
const AUTH_RESET_RELEASE='legavik-auth-reset-login-20260906-2';
const RECOVERY_URL=`${CANONICAL_BASE}/account/index.html?token_hash={{ .TokenHash }}&type=recovery&auth_action=recovery&release=${AUTH_RESET_RELEASE}#reset-password`;

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[char]);

const email=({heading,body,actionLabel,actionUrl,code,detail,brandHeader=true})=>`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f7f4ed;color:#123d32;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ed"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dce4df;border-radius:12px">
${brandHeader?`<tr data-brand-header><td style="padding:28px 32px 16px;font-size:22px;font-weight:700;letter-spacing:.04em;color:#064f3b">${BRAND}</td></tr>`:''}
<tr><td style="padding:${brandHeader?'0':'28px'} 32px 32px"><h1 style="margin:0 0 18px;font-size:24px;line-height:1.35;color:#064f3b">${escapeHtml(heading)}</h1>
${body.map(line=>`<p style="margin:0 0 14px;font-size:16px;line-height:1.65">${line}</p>`).join('')}
${code?`<p style="margin:22px 0;padding:16px;background:#eef5f1;border-radius:8px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>`:''}
${actionLabel&&actionUrl?`<p style="margin:24px 0"><a href="${actionUrl}" style="display:inline-block;padding:12px 20px;border-radius:7px;background:#075b45;color:#fff;text-decoration:none;font-weight:700">${escapeHtml(actionLabel)}</a></p>`:''}
${detail?`<p style="margin:18px 0 0;font-size:13px;line-height:1.55;color:#5c6b65">${detail}</p>`:''}
<p style="margin:28px 0 0;font-size:13px;color:#697771">${BRAND}<br>${TAGLINE}</p></td></tr></table>
</td></tr></table></body></html>`;

export const LEGAVIK_AUTH_BRANDING=Object.freeze({
  brand:BRAND,
  tagline:TAGLINE,
  category:'Digital Asset Recovery Infrastructure',
  canonicalBase:CANONICAL_BASE,
  managementApiPatch:Object.freeze({
    smtp_sender_name:BRAND,
    mailer_subjects_confirmation:`${BRAND}｜验证您的邮箱`,
    mailer_templates_confirmation_content:email({heading:'验证您的邮箱',body:['请输入以下验证码，完成邮箱验证。'],code:'{{ .Token }}',detail:'如果您没有发起此操作，请忽略本邮件。'}),
    mailer_subjects_invite:`${BRAND}｜账户邀请`,
    mailer_templates_invite_content:email({heading:'接受账户邀请',body:['您已受邀使用 LEGAVIK。'],actionLabel:'接受邀请',actionUrl:'{{ .ConfirmationURL }}',detail:'如果您不认识此邀请，请忽略本邮件。'}),
    mailer_subjects_magic_link:`${BRAND}｜登录验证码`,
    mailer_templates_magic_link_content:email({heading:'登录验证码',body:['请输入以下验证码以继续登录。'],code:'{{ .Token }}',detail:'请勿向任何人透露此验证码。'}),
    mailer_subjects_recovery:`${BRAND}｜重置密码`,
    mailer_templates_recovery_content:email({heading:'重置登录密码',body:['我们收到了重置您 LEGAVIK 登录密码的请求。','点击下面的按钮设置新密码：'],actionLabel:'设置新密码',actionUrl:RECOVERY_URL,detail:'如果您没有申请重置密码，请忽略此邮件，您当前的登录密码不会改变。',brandHeader:false}),
    mailer_subjects_email_change:`${BRAND}｜确认新邮箱`,
    mailer_templates_email_change_content:email({heading:'确认新邮箱',body:['请确认将账户邮箱更新为 {{ .NewEmail }}。'],actionLabel:'确认新邮箱',actionUrl:'{{ .ConfirmationURL }}',detail:'如果您没有发起此操作，请立即检查账户安全。'}),
    mailer_subjects_reauthentication:`${BRAND}｜身份验证码`,
    mailer_templates_reauthentication_content:email({heading:'身份验证码',body:['请输入以下验证码以确认本次敏感操作。'],code:'{{ .Token }}',detail:'请勿向任何人透露此验证码。'}),
    mailer_subjects_password_changed_notification:`${BRAND}｜密码已更新`,
    mailer_templates_password_changed_notification_content:email({heading:'您的密码已更新',body:['您的 LEGAVIK 账户密码刚刚完成更新。'],detail:'如果这不是您本人操作，请立即重置密码并联系支持。'}),
    mailer_subjects_email_changed_notification:`${BRAND}｜邮箱已更新`,
    mailer_templates_email_changed_notification_content:email({heading:'您的邮箱已更新',body:['您的 LEGAVIK 账户邮箱已完成更新。'],detail:'如果这不是您本人操作，请立即联系支持。'}),
    mailer_subjects_phone_changed_notification:`${BRAND}｜手机号已更新`,
    mailer_templates_phone_changed_notification_content:email({heading:'您的手机号已更新',body:['您的 LEGAVIK 账户手机号已完成更新。'],detail:'如果这不是您本人操作，请立即联系支持。'}),
    mailer_subjects_mfa_factor_enrolled_notification:`${BRAND}｜已添加验证方式`,
    mailer_templates_mfa_factor_enrolled_notification_content:email({heading:'已添加新的验证方式',body:['您的账户刚刚添加了一种新的身份验证方式。'],detail:'如果这不是您本人操作，请立即检查账户安全。'}),
    mailer_subjects_mfa_factor_unenrolled_notification:`${BRAND}｜已移除验证方式`,
    mailer_templates_mfa_factor_unenrolled_notification_content:email({heading:'已移除一种验证方式',body:['您的账户刚刚移除了一种身份验证方式。'],detail:'如果这不是您本人操作，请立即检查账户安全。'}),
    mailer_subjects_identity_linked_notification:`${BRAND}｜已关联登录方式`,
    mailer_templates_identity_linked_notification_content:email({heading:'已关联新的登录方式',body:['您的账户刚刚关联了一种新的登录方式。'],detail:'如果这不是您本人操作，请立即检查账户安全。'}),
    mailer_subjects_identity_unlinked_notification:`${BRAND}｜已移除登录方式`,
    mailer_templates_identity_unlinked_notification_content:email({heading:'已移除一种登录方式',body:['您的账户刚刚移除了一种登录方式。'],detail:'如果这不是您本人操作，请立即检查账户安全。'}),
    sms_template:`${BRAND} 验证码：{{ .Code }}。请勿向任何人透露此验证码。`
  })
});

export const renderRepresentativeSamples=()=>Object.freeze({
  signupOtp:LEGAVIK_AUTH_BRANDING.managementApiPatch.mailer_templates_confirmation_content.replace('{{ .Token }}','123456'),
  resetPassword:LEGAVIK_AUTH_BRANDING.managementApiPatch.mailer_templates_recovery_content.replace('{{ .TokenHash }}','sample-token-hash'),
  securityNotification:LEGAVIK_AUTH_BRANDING.managementApiPatch.mailer_templates_password_changed_notification_content,
  otpSms:LEGAVIK_AUTH_BRANDING.managementApiPatch.sms_template.replace('{{ .Code }}','123456')
});
