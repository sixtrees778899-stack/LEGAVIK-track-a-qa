import { ValidationError } from '../shared/errors.js';

const TYPES=new Set(['text','long_text','choice','multi_choice','boolean','date','relation','ordered_relation','custom_fields','attachment_refs']);
const OPERATORS=new Set(['equals','not_equals','contains','exists']);
const codePoints=value=>[...value].length;
const clone=value=>structuredClone(value);

export function validateDeclarativeTemplate(configuration){
  if(!configuration||!Array.isArray(configuration.modules))throw new ValidationError('INVALID_TEMPLATE','Module configuration is required');
  const fieldIds=new Set();for(const module of configuration.modules){if(typeof module.id!=='string'||!Array.isArray(module.fields))throw new ValidationError('INVALID_TEMPLATE','Module and fields are required');for(const field of module.fields){if(!field.id||fieldIds.has(`${module.id}:${field.id}`)||!TYPES.has(field.field_type))throw new ValidationError('INVALID_FIELD','Field definition is invalid');fieldIds.add(`${module.id}:${field.id}`);if(field.condition){if(!OPERATORS.has(field.condition.operator)||typeof field.condition.field_id!=='string'||!('value'in field.condition)&&field.condition.operator!=='exists')throw new ValidationError('INVALID_CONDITION','Only declarative conditions are allowed');}for(const value of Object.values(field))if(typeof value==='function')throw new ValidationError('EXECUTABLE_TEMPLATE','Template code execution is forbidden');}}
  return true;
}

function normalizeValue(field,value,limits){
  if(value===undefined||value===null)return value;
  if(['text','long_text','choice','date','relation'].includes(field.field_type)){if(typeof value!=='string')throw new ValidationError('DRAFT_TYPE_MISMATCH',`${field.id} must be text`);return value.normalize('NFC').trim();}
  if(field.field_type==='boolean'){if(typeof value!=='boolean')throw new ValidationError('DRAFT_TYPE_MISMATCH',`${field.id} must be boolean`);return value;}
  if(['multi_choice','ordered_relation','attachment_refs'].includes(field.field_type)){if(!Array.isArray(value)||value.some(item=>typeof item!=='string'))throw new ValidationError('DRAFT_TYPE_MISMATCH',`${field.id} must be a string array`);return value.map(item=>item.normalize('NFC').trim());}
  if(field.field_type==='custom_fields'){if(!Array.isArray(value)||value.length>limits.max_fields_per_module)throw new ValidationError('DRAFT_TYPE_MISMATCH',`${field.id} must be a limited array`);return value.map(item=>{if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(key=>!['label','value','field_type'].includes(key))||typeof item.label!=='string'||typeof item.value!=='string'||!['text','long_text'].includes(item.field_type??'text'))throw new ValidationError('INVALID_CUSTOM_FIELD','Custom field is invalid');const label=item.label.normalize('NFC').trim(),fieldValue=item.value.normalize('NFC').trim();if(codePoints(label)>limits.max_label_code_points||codePoints(fieldValue)>limits.max_value_code_points)throw new ValidationError('CUSTOM_FIELD_LIMIT','Custom field exceeds limits');return{label,value:fieldValue,field_type:item.field_type??'text'};});}
  throw new ValidationError('DRAFT_TYPE_MISMATCH','Unsupported field type');
}

export function normalizeDraftV2(draft,configuration,{limits={max_fields_per_module:50,max_label_code_points:120,max_value_code_points:10000}}={}){
  validateDeclarativeTemplate(configuration);if(!draft||typeof draft!=='object'||Array.isArray(draft))throw new ValidationError('INVALID_DRAFT','Draft must be an object');const output={draft_version:2,modules:{}};
  for(const module of configuration.modules){const source=draft.modules?.[module.id]??{entries:[]};if(!source||typeof source!=='object'||Array.isArray(source)||!Array.isArray(source.entries))throw new ValidationError('DRAFT_TYPE_MISMATCH',`${module.id} entries must be an array`);output.modules[module.id]={entries:source.entries.map((entry,index)=>{if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new ValidationError('DRAFT_TYPE_MISMATCH',`${module.id}[${index}] must be an object`);const allowed=new Set(module.fields.map(field=>field.id));for(const key of Object.keys(entry))if(!allowed.has(key))throw new ValidationError('UNKNOWN_DRAFT_FIELD',`Unknown field: ${module.id}.${key}`);const normalized={};for(const field of module.fields)if(field.id in entry)normalized[field.id]=normalizeValue(field,entry[field.id],limits);return normalized;})};}
  return clone(output);
}
