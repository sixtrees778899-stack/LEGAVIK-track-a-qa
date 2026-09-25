const clone=value=>structuredClone(value);
const duplicateCount=values=>values.length-new Set(values).size;

export function summarizeVersionUpdateSource(snapshot){
  const graph=snapshot?.knowledge_graph??{},locations=new Map((graph.locations??[]).map(item=>[item.id,item]));
  return Object.freeze({schema_version:Number(graph.schema_version??0),account_count:(graph.assets??[]).length,accounts:(graph.assets??[]).map(asset=>{
    const conditions=(asset.condition_refs??[]).map(id=>(graph.recovery_conditions??[]).find(item=>item.id===id)).filter(Boolean);
    return{account_id:asset.id,platform_id:asset.platform_hint??null,selected_conditions_count:conditions.length,dangling_condition_ref_count:(asset.condition_refs??[]).length-conditions.length,conditions:conditions.map((condition,index)=>{
      const refs=[...(condition.location_refs??[])],resolved=refs.map(id=>locations.get(id)).filter(Boolean);
      return{condition_index:index+1,location_ref_count:refs.length,has_location_ref:refs.length>0,all_location_refs_resolve:refs.length>0&&resolved.length===refs.length,has_related_attachment_reference:resolved.some(item=>(item.attachment_refs??[]).length>0),duplicate_ref:duplicateCount(refs)>0,dangling_ref:resolved.length!==refs.length};
    })};
  })});
}

const validAttachment=file=>file?.technical_status==='VALID'&&Number.isSafeInteger(file.byte_length)&&file.byte_length>0&&/^[a-f0-9]{64}$/.test(file.sha256??'')&&Boolean(file.mime_type&&file.account_id&&file.module_id&&file.field_or_condition_id&&file.purpose);
const moduleSummarySupports=store=>Object.values(store.attachments).some(file=>validAttachment(file)&&file.module_id==='locations'&&file.field_or_condition_id==='module-summary');
const fileSupports=(store,ids,accountId,conditionId)=>ids.some(id=>{const file=store.attachments[id];return validAttachment(file)&&file.account_id===accountId&&file.module_id==='locations'&&(file.covered_condition_ids.includes(conditionId)||file.field_or_condition_id===conditionId);});

export function summarizeVersionUpdateRuntime({source,store,receipt}){
  const summary=moduleSummarySupports(store),issues=new Map(receipt.validation_issues.filter(item=>item.issue_code==='LOCATION_COVERAGE_REQUIRED').map(item=>[item.account_id,item]));
  const accounts=Object.values(store.accounts).map(account=>{
    const selected=[...(store.condition_selections[account.account_id]?.selected_condition_ids??[])],coverages=Object.values(store.location_coverages).filter(item=>item.account_id===account.account_id),issue=issues.get(account.account_id),reasons=new Map((issue?.missing_parts??[]).map(value=>{const at=value.lastIndexOf(':');return[value.slice(0,at),value.slice(at+1)];}));
    const conditions=selected.map((conditionId,index)=>{const raw=coverages.filter(item=>item.covered_condition_ids.includes(conditionId)),complete=raw.filter(item=>Boolean(item.description.trim()||item.location_name.trim()||fileSupports(store,item.attachment_ids,account.account_id,conditionId))),reason=reasons.get(conditionId);return{condition_index:index+1,coverage_match_count:raw.length,valid_coverage_match_count:complete.length,validator_status:summary?'VALID':reason==='DUPLICATE'?'DUPLICATE':reason==='MISSING'?'MISSING':complete.length===1?'VALID':complete.length>1?'DUPLICATE':'MISSING'};});
    return{account_id:account.account_id,platform_id:account.platform_id,selected_conditions_count:selected.length,location_coverages_count:coverages.length,missing_count:conditions.filter(item=>item.validator_status==='MISSING').length,duplicate_count:conditions.filter(item=>item.validator_status==='DUPLICATE').length,dangling_attachment_ref_count:coverages.reduce((count,item)=>count+item.attachment_ids.filter(id=>!store.attachments[id]).length,0),conditions};
  });
  return clone({source,imported_draft:{account_count:accounts.length,accounts},validation:{module_summary_support:summary,generation_allowed:Boolean(receipt.generation_allowed),accounts:accounts.map(item=>({account_id:item.account_id,conditions:item.conditions}))}});
}
