const VERIFICATION_EVENTS=new Set(['INITIAL_RECOVERY_VERIFICATION','ONLINE_RECOVERY']);

const isPass=event=>String(event?.result??'').toUpperCase()==='PASS';
const eventTime=event=>new Date(event?.occurred_at??0).getTime();

export function currentRecoveryVerification(map,events=[]){
  const current=map?.current_version;
  if(!current)return{verified:false,version:null,lastVerifiedAt:null};
  const successful=events.filter(event=>event.recovery_map_version_id===current.id&&VERIFICATION_EVENTS.has(event.event_type)&&isPass(event)).sort((left,right)=>eventTime(right)-eventTime(left));
  return{verified:successful.length>0,version:current.version_number,lastVerifiedAt:successful[0]?.occurred_at??null};
}

export function authoritativeCurrentVersion(map){
  if(!map?.current_version_id||!Array.isArray(map.versions))return null;
  return map.versions.find(version=>version.id===map.current_version_id&&version.status==='CURRENT')??null;
}

export function mayUpdateRecoveryVersion(map,version){
  const current=authoritativeCurrentVersion(map);
  return Boolean(current&&version&&version.id===current.id&&version.version_number===current.version_number);
}

export function guidedRecoveryDrills(map,events=[]){
  const versions=new Map((map?.versions??[]).map(version=>[version.id,version.version_number]));
  return events.filter(event=>event.event_type==='GUIDED_RECOVERY_DRILL'&&versions.has(event.recovery_map_version_id)).sort((left,right)=>eventTime(right)-eventTime(left)).map(event=>({version:versions.get(event.recovery_map_version_id),occurredAt:event.occurred_at,result:isPass(event)?'PASS':'NOT_COMPLETED'}));
}

export function customerVisibleMaterials(materials=[],plan=''){
  const privatePlan=String(plan).trim().toLowerCase();
  if(['legacy / private','legacy','private','传承定制版'].includes(privatePlan))return materials;
  return materials.filter(item=>!['LOCAL_ENCRYPTED_BACKUP','LOCAL_BACKUP','ARCHIVE'].includes(String(item?.material_type??'').toUpperCase())&&!/\.cjasvault$/i.test(String(item?.filename??'')));
}
