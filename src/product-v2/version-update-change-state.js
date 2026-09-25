const OMITTED_KEYS=new Set(['draft_id','draft_revision','created_at','updated_at','saved_at','generated_at','bytes']);

function normalized(value,key=''){
  if(OMITTED_KEYS.has(key))return undefined;
  if(Array.isArray(value))return value.map(item=>normalized(item));
  if(value&&typeof value==='object'){
    const result={};
    for(const name of Object.keys(value).sort()){
      const item=normalized(value[name],name);
      if(item!==undefined)result[name]=item;
    }
    return result;
  }
  return value;
}

export function versionUpdateContentFingerprint(store){
  return JSON.stringify(normalized(store));
}

export function versionUpdateHasContentChanges(store,baselineFingerprint){
  return Boolean(baselineFingerprint)&&versionUpdateContentFingerprint(store)!==baselineFingerprint;
}
