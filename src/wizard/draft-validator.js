const hasExpectedType=(step,value)=>step.type==='custom-fields'?Array.isArray(value):typeof value==='string';
const isAnswered=value=>value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0);

export function validateWizardDraft(configuration,draft){
  const issues=[];
  for(const module of configuration?.modules??[]){
    const entries=draft?.modules?.[module.module_id];
    if(!Array.isArray(entries)){
      issues.push({severity:'critical',blocking:true,code:'TYPE',module_id:module.module_id,entry_index:null,field_id:null,message:'模块数据格式不正确'});
      continue;
    }
    entries.forEach((entry,entryIndex)=>{
      if(!entry||typeof entry!=='object'||Array.isArray(entry)){
        issues.push({severity:'critical',blocking:true,code:'TYPE',module_id:module.module_id,entry_index:entryIndex,field_id:null,message:'条目数据格式不正确'});
        return;
      }
      for(const step of module.steps){
        if(step.condition&&entry[step.condition.field]!==step.condition.equals)continue;
        const value=entry[step.id];
        if(value!==undefined&&value!==null&&!hasExpectedType(step,value))issues.push({severity:'critical',blocking:true,code:'TYPE',module_id:module.module_id,entry_index:entryIndex,field_id:step.id,message:'字段数据格式不正确'});
        if(step.required&&!isAnswered(value))issues.push({severity:'critical',blocking:true,code:'REQUIRED',module_id:module.module_id,entry_index:entryIndex,field_id:step.id,message:'请完成此必填项'});
      }
    });
  }
  return {valid:issues.length===0,issues};
}

export function safeCustomFields(value){return Array.isArray(value)?value:[];}
