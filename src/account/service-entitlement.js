const ACTIVE_TEST_STATUS='ACTIVE_TEST';
const STANDARD_PLAN='STANDARD';

export function normalizeServiceEntitlement(payload){
  const row=Array.isArray(payload)?payload[0]:payload;
  if(!row||typeof row!=='object')return null;
  const planCode=String(row.plan_code??'').trim().toUpperCase();
  const status=String(row.status??'').trim().toUpperCase();
  if(planCode!==STANDARD_PLAN||status!==ACTIVE_TEST_STATUS)return null;
  return Object.freeze({
    enrollmentId:String(row.enrollment_id??''),
    planCode,
    planLabel:'Standard',
    status,
    enrollmentSource:String(row.enrollment_source??''),
    reviewUsed:Number(row.review_used??0),
    reviewAllowance:Number(row.review_allowance??0),
    updateUsed:Number(row.update_used??0),
    updateAllowance:Number(row.update_allowance??0)
  });
}

export async function readAuthoritativeServiceEntitlement(supabase){
  if(!supabase?.rpc)throw new TypeError('Supabase RPC client is required');
  const {data,error}=await supabase.rpc('get_service_entitlement_v1');
  if(error)throw error;
  return normalizeServiceEntitlement(data);
}

export const canCreateRecoveryMap=entitlement=>entitlement?.planCode===STANDARD_PLAN&&entitlement?.status===ACTIVE_TEST_STATUS;
