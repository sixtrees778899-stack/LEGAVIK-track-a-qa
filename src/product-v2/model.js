export const MODULE_IDS=Object.freeze(['accounts','conditions','locations','instructions','assistants','message']);
export const FIELD_STATES=Object.freeze(['EMPTY','UNKNOWN','LATER','VALID','INVALID']);
export const VERSION_STATES=Object.freeze(['DRAFT','REVIEW_READY','GENERATED','SUPERSEDED','ARCHIVED']);
export const ASSISTANCE_STATES=Object.freeze(['NOT_SET','NEED','NOT_NEEDED','UNKNOWN']);
export const clone=value=>structuredClone(value);
export const field=(value='',state=value?'VALID':'EMPTY')=>({state,value});
export const nowIso=clock=>typeof clock==='function'?clock():new Date().toISOString();

export function createRecoveryMapDraft({draftId='draft-v2',title='我的恢复地图',rulebookVersion='2.0.0',sourceVersionId=null,clock}={}){const now=nowIso(clock);return{model_version:2,draft_id:draftId,draft_revision:0,rulebook_version:rulebookVersion,source_version_id:sourceVersionId,title,accounts:{},condition_selections:{},location_coverages:{},recovery_instructions:{},assistant_decision:'NOT_SET',assistants:{},personal_message:null,attachments:{},version:{version_id:`version-${draftId}`,version_number:1,status:'DRAFT',source_version_id:sourceVersionId,draft_revision:0,rulebook_version:rulebookVersion,created_at:now,generated_at:null},created_at:now,updated_at:now};}
export function createRecoveryMapDraftId({prefix='v2-local',randomUUID=()=>crypto.randomUUID()}={}){return`${prefix}-${randomUUID()}`;}
export function accountLabel(account,platformTemplates){const platform=platformTemplates.platforms.find(item=>item.id===account.platform_id),base=account.platform_name||platform?.name||'未选择平台',nickname=account.display_label?.trim();return nickname?`${base} · ${nickname}`:base;}
export function selectedConditions(store,accountId){return store.condition_selections[accountId]?.selected_condition_ids??[];}
export function accountAttachments(store,accountId){return Object.values(store.attachments).filter(file=>file.account_id===accountId);}
