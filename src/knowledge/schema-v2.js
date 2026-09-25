export const KNOWLEDGE_SCHEMA_VERSION_V2=2;
export const STANDARD_MODULE_IDS=Object.freeze(['assets-accounts','recovery-conditions','locations-finding','contacts-assistance','recovery-order-exceptions','evidence-messages']);
export const V2_COLLECTIONS=Object.freeze(['standard_modules','custom_modules','assets','recovery_conditions','fallback_paths','locations','contacts','recovery_steps','warnings','attachments','custom_fields']);
export const knowledgeSchemaV2=Object.freeze({
  schema_version:KNOWLEDGE_SCHEMA_VERSION_V2,
  root_fields:['schema_version','vault_title','plan_type','reviewed_at','standard_modules','custom_modules','assets','recovery_conditions','fallback_paths','locations','assistance','contacts','recovery_steps','warnings','attachments','personal_message','custom_fields'],
  collections:{
    standard_modules:['id','order'],custom_modules:['id','name','order','enabled','custom_field_refs','attachment_refs'],
    assets:['id','type','label','exists','platform_hint','condition_refs','location_refs','contact_refs','step_refs','attachment_refs','custom_field_refs'],
    recovery_conditions:['id','type','exists','asset_refs','location_refs','fallback_path_refs','notes','custom_field_refs'],
    fallback_paths:['id','condition_ref','scenario','action','contact_refs','location_refs','stop_condition'],
    locations:['id','label','type','finding_instructions','access_prerequisites','attachment_refs','custom_field_refs'],
    contacts:['id','label','role','when_to_contact','assistance_boundary','alternate_contact_ref','custom_field_refs'],
    recovery_steps:['id','sequence','risk_level','action','completion_check','failure_action','stop_condition','asset_refs','condition_refs','location_refs','contact_refs','warning_refs','attachment_refs'],
    warnings:['id','risk_level','instruction','applies_to_refs'],
    attachments:['id','display_name','media_type','byte_length','sha256','module_refs','owner_entity_refs','purpose','sensitive_acknowledged'],
    custom_fields:['id','module_ref','label','field_type','value']
  }
});
