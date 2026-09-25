import { ENTITY_COLLECTIONS, KNOWLEDGE_SCHEMA_VERSION } from '../domain/constants.js';
import { ValidationError } from '../shared/errors.js';
import { knowledgeSchemaV1 } from './schema.js';
import { normalizeMimeType } from '../shared/mime-type.js';
const ID_RE = new RegExp(knowledgeSchemaV1.id_pattern), SHA256_RE = /^[a-f0-9]{64}$/;
const ROOT_FIELDS = new Set(['schema_version','vault_title','reviewed_at','next_review_at','global_instructions',...ENTITY_COLLECTIONS]);
const REQUIRED = {
  assets:['id','label','category','recovery_goal'], locations:['id','label','location_type','description'], contacts:['id','label','role'], devices:['id','label','device_type'],
  orders:['id','label','sequence','action','prerequisites','expected_result','failure_action','risk_level'], hints:['id','label','content'], warnings:['id','label','risk_level','instruction'],
  attachments:['id','display_name','media_type','size','sha256','owner_refs','purpose','sensitive_acknowledged'], custom_categories:['id','label','enabled'], custom_fields:['id','label','value','owner_refs']
};
const REF_FIELDS = { location_refs:'locations',contact_refs:'contacts',device_refs:'devices',order_refs:'orders',hint_refs:'hints',warning_refs:'warnings',attachment_refs:'attachments',custom_field_refs:'custom_fields',asset_refs:'assets',owner_refs:'*',applies_to_refs:'*',prerequisite_order_refs:'orders',usual_location_ref:'locations',alternate_contact_ref:'contacts' };
const issue=(errors,path,code,message)=>errors.push({path,code,message});
const isText=(value)=>typeof value==='string'&&value.trim().length>0&&value.length<=10000;
export function validateKnowledgeMap(input) {
  const errors=[]; if(!input||typeof input!=='object'||Array.isArray(input)) return {valid:false,errors:[{path:'$',code:'TYPE',message:'Knowledge map must be an object'}]};
  for(const key of Object.keys(input)) if(!ROOT_FIELDS.has(key)) issue(errors,`$.${key}`,'UNKNOWN_FIELD','Unknown root field');
  if(input.schema_version!==KNOWLEDGE_SCHEMA_VERSION) issue(errors,'$.schema_version','UNSUPPORTED_VERSION','Knowledge schema version must be 1');
  if(!isText(input.vault_title)) issue(errors,'$.vault_title','REQUIRED','Vault title is required');
  if(!isText(input.reviewed_at)) issue(errors,'$.reviewed_at','REQUIRED','Reviewed date is required');
  const ids=new Map();
  for(const collection of ENTITY_COLLECTIONS){
    if(!Array.isArray(input[collection])){issue(errors,`$.${collection}`,'TYPE',`${collection} must be an array`);continue;}
    if(input[collection].length>10000) issue(errors,`$.${collection}`,'LIMIT','Collection is too large');
    input[collection].forEach((entity,index)=>{const path=`$.${collection}[${index}]`;if(!entity||typeof entity!=='object'||Array.isArray(entity)){issue(errors,path,'TYPE','Entity must be an object');return;}
      const allowed=new Set(knowledgeSchemaV1.collections[collection]);for(const key of Object.keys(entity))if(!allowed.has(key))issue(errors,`${path}.${key}`,'UNKNOWN_FIELD','Unknown entity field');
      for(const field of REQUIRED[collection])if(!(field in entity)||entity[field]===''||entity[field]===null)issue(errors,`${path}.${field}`,'REQUIRED','Required field is missing');
      if(!ID_RE.test(entity.id??''))issue(errors,`${path}.id`,'INVALID_ID','Invalid entity ID');else if(ids.has(entity.id))issue(errors,`${path}.id`,'DUPLICATE_ID',`Duplicate ID also used at ${ids.get(entity.id).path}`);else ids.set(entity.id,{collection,path});
      for(const [key,value] of Object.entries(entity))if(key.endsWith('_refs')||key==='owner_refs'||key==='applies_to_refs'||key==='prerequisites')if(!Array.isArray(value)||value.some((item)=>typeof item!=='string'))issue(errors,`${path}.${key}`,'TYPE',`${key} must be a string array`);
      if(collection==='orders'){if(!Number.isInteger(entity.sequence)||entity.sequence<1)issue(errors,`${path}.sequence`,'RANGE','Order sequence must be positive');if(!['low','medium','high','critical'].includes(entity.risk_level))issue(errors,`${path}.risk_level`,'ENUM','Invalid risk level');}
      if(collection==='attachments'){if(!Number.isSafeInteger(entity.size)||entity.size<0||entity.size>1024**3)issue(errors,`${path}.size`,'RANGE','Attachment size is invalid');if(!SHA256_RE.test(entity.sha256??''))issue(errors,`${path}.sha256`,'FORMAT','Attachment SHA-256 must be lowercase hex');try{if(normalizeMimeType(entity.media_type)!==entity.media_type)issue(errors,`${path}.media_type`,'FORMAT','Attachment MIME type must be normalized');}catch{issue(errors,`${path}.media_type`,'FORMAT','Attachment MIME type is invalid');}if(typeof entity.sensitive_acknowledged!=='boolean')issue(errors,`${path}.sensitive_acknowledged`,'TYPE','Sensitive acknowledgement must be boolean');}
    });
  }
  for(const collection of ENTITY_COLLECTIONS)for(const [index,entity] of (Array.isArray(input[collection])?input[collection]:[]).entries()){if(!entity||typeof entity!=='object')continue;for(const [field,expected] of Object.entries(REF_FIELDS)){if(!(field in entity))continue;const values=field.endsWith('_ref')?[entity[field]]:entity[field];if(!Array.isArray(values))continue;for(const ref of values){if(!ref)continue;const target=ids.get(ref);if(!target)issue(errors,`$.${collection}[${index}].${field}`,'MISSING_REFERENCE',`Reference does not exist: ${ref}`);else if(expected!=='*'&&target.collection!==expected)issue(errors,`$.${collection}[${index}].${field}`,'WRONG_REFERENCE_TYPE',`Expected ${expected}, got ${target.collection}`);}}}
  return {valid:errors.length===0,errors};
}
export function assertValidKnowledgeMap(input){const result=validateKnowledgeMap(input);if(!result.valid)throw new ValidationError('INVALID_KNOWLEDGE_MAP','Recovery Knowledge Map validation failed',result.errors);return input;}
