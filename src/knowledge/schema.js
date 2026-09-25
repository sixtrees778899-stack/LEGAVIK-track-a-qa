import { KNOWLEDGE_SCHEMA_VERSION } from '../domain/constants.js';
export const knowledgeSchemaV1 = Object.freeze({
  schema_version: KNOWLEDGE_SCHEMA_VERSION, unknown_fields: 'reject', id_pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$',
  collections: {
    assets: ['id','label','category','existence_note','recovery_goal','location_refs','contact_refs','device_refs','order_refs','hint_refs','warning_refs','attachment_refs','custom_field_refs'],
    locations: ['id','label','location_type','description','access_prerequisites','verification_note','custom_field_refs'],
    contacts: ['id','label','role','contact_method','when_to_contact','reason_to_contact','knows','does_not_know','alternate_contact_ref','critical','custom_field_refs'],
    devices: ['id','label','device_type','usual_location_ref','identifying_features','prerequisites','risk_note','asset_refs','order_refs','custom_field_refs'],
    orders: ['id','label','sequence','action','prerequisites','prerequisite_order_refs','expected_result','failure_action','risk_level','asset_refs','location_refs','contact_refs','device_refs','warning_refs','hint_refs','attachment_refs','custom_field_refs'],
    hints: ['id','label','content','applies_to_refs','display_timing','misuse_risk','custom_field_refs'],
    warnings: ['id','label','risk_level','trigger','instruction','stop_condition','contact_refs','order_refs','custom_field_refs'],
    attachments: ['id','display_name','media_type','size','sha256','owner_refs','purpose','sensitive_acknowledged','custom_field_refs'],
    custom_categories: ['id','label','description','enabled'], custom_fields: ['id','label','value','description','owner_refs']
  }
});
