import { ValidationError } from '../shared/errors.js';

const BLOCKING_VALIDATOR_CODES = new Set([
  'TYPE','REQUIRED','UNKNOWN_FIELD','UNSUPPORTED_VERSION','LIMIT','INVALID_ID',
  'DUPLICATE_ID','RANGE','ENUM','FORMAT','MISSING_REFERENCE','WRONG_REFERENCE_TYPE'
]);

const COLLECTION_TARGETS = Object.freeze({
  assets:{module_id:'wallet-assets',field_id:'wallet-label'},
  locations:{module_id:'devices-locations',field_id:'device-location'},
  contacts:{module_id:'contacts-assistance',field_id:'assistant-role'},
  devices:{module_id:'devices-locations',field_id:'primary-device'},
  orders:{module_id:'recovery-orders-warnings',field_id:'first-action'},
  hints:{module_id:'recovery-orders-warnings',field_id:'first-action'},
  warnings:{module_id:'recovery-orders-warnings',field_id:'risk-warning'},
  attachments:{module_id:'devices-locations',field_id:'device-attachment'},
  custom_categories:{module_id:'custom',field_id:'custom-module-name'},
  custom_fields:{module_id:'wallet-assets',field_id:'wallet-custom'}
});
const FIELD_TARGETS = Object.freeze({
  assets:{label:'wallet-label',existence_note:'wallet-exists',location_refs:'device-location',contact_refs:'has-assistant',order_refs:'first-action',attachment_refs:'device-attachment',custom_field_refs:'wallet-custom'},
  locations:{label:'device-location',description:'device-location'},
  contacts:{label:'assistant-role',role:'assistant-role'},
  devices:{label:'primary-device',usual_location_ref:'device-location',identifying_features:'primary-device'},
  orders:{action:'first-action',prerequisites:'first-action',expected_result:'expected-result',failure_action:'failure-action',warning_refs:'risk-warning'},
  warnings:{instruction:'risk-warning'},attachments:{display_name:'device-attachment',media_type:'device-attachment',size:'device-attachment',sha256:'device-attachment',owner_refs:'device-attachment',purpose:'device-attachment'},
  custom_categories:{label:'custom-module-name'},custom_fields:{label:'wallet-custom',value:'wallet-custom',owner_refs:'wallet-custom'}
});
const RELATION_TARGETS = Object.freeze({
  'assets.location_refs':{module_id:'devices-locations',field_id:'device-location'},
  'assets.contact_refs':{module_id:'contacts-assistance',field_id:'has-assistant'},
  'assets.order_refs':{module_id:'recovery-orders-warnings',field_id:'first-action'},
  'assets.attachment_refs':{module_id:'devices-locations',field_id:'device-attachment'}
});

export function targetForKnowledgePath(path=''){
  const match=/^\$\.([a-z_]+)(?:\[(\d+)\])?(?:\.([a-z_]+))?/.exec(path);
  const collection=match?.[1],schemaField=match?.[3]??null,base=COLLECTION_TARGETS[collection]??{module_id:null,field_id:null},relation=RELATION_TARGETS[`${collection}.${schemaField}`],target=relation??{...base,field_id:FIELD_TARGETS[collection]?.[schemaField]??base.field_id};
  return {...target,entry_index:match?.[2]===undefined?null:Number(match[2]),schema_field:schemaField,path};
}

export function validatorIssue(error){
  return {
    severity:BLOCKING_VALIDATOR_CODES.has(error.code)?'critical':'attention',
    blocking:BLOCKING_VALIDATOR_CODES.has(error.code),
    dimension:'Structure',
    code:error.code,
    message:error.message,
    ...targetForKnowledgePath(error.path)
  };
}

export function hasBlockingIssues(result){return result.issues.some(item=>item.blocking===true||item.severity==='critical');}

export function assertReadyForGeneration(result){
  if(hasBlockingIssues(result))throw new ValidationError('REVIEW_BLOCKED','请先修复恢复计划中的必填或格式问题',result.issues.filter(item=>item.blocking===true||item.severity==='critical'));
  return result;
}
