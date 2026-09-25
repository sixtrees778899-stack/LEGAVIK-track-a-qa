import { ValidationError } from '../shared/errors.js';

function isAnswered(value){return value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0);}
export class WizardFlowEngine {
  constructor(configuration, draft) {
    if(!configuration?.modules)throw new ValidationError('INVALID_WIZARD_CONFIG','Wizard configuration is required');
    this.configuration=configuration;this.answers={...(draft?.answers??{})};this.skipped=new Set(draft?.skipped??[]);this.position=0;this.refresh();
    if(draft?.current_step_id){const index=this.steps.findIndex((step)=>step.id===draft.current_step_id);if(index>=0)this.position=index;}
  }
  conditionMet(step){if(!step.condition)return true;const value=this.answers[step.condition.field];if('equals'in step.condition)return value===step.condition.equals;if('not_equals'in step.condition)return value!==step.condition.not_equals;return false;}
  refresh(){this.steps=this.configuration.modules.flatMap((module)=>module.steps.map((step)=>({...step,module_id:module.module_id}))).filter((step)=>this.conditionMet(step));if(this.position>=this.steps.length)this.position=Math.max(0,this.steps.length-1);}
  current(){return this.steps[this.position]??null;}
  answer(value){const step=this.current();if(!step)throw new ValidationError('WIZARD_COMPLETE','Wizard is complete');if(step.type==='choice'&&!step.options.includes(value))throw new ValidationError('INVALID_OPTION','Answer is not an allowed option');this.answers[step.id]=value;this.skipped.delete(step.id);this.refresh();return this.current();}
  validateCurrent(){const step=this.current();if(!step)return {valid:true};if(step.required&&!isAnswered(this.answers[step.id])&&!this.skipped.has(step.id))return {valid:false,error:{code:'REQUIRED',step_id:step.id,message:'Required answer is missing'}};return {valid:true};}
  next(){const result=this.validateCurrent();if(!result.valid)throw new ValidationError(result.error.code,result.error.message,[result.error]);if(this.position<this.steps.length-1)this.position++;else this.position=this.steps.length;return this.current();}
  back(){if(this.position>0)this.position--;return this.current();}
  skip(){const step=this.current();if(!step)throw new ValidationError('WIZARD_COMPLETE','Wizard is complete');if(step.required||!step.skip_allowed)throw new ValidationError('SKIP_NOT_ALLOWED','This step cannot be skipped');this.skipped.add(step.id);return this.next();}
  progress(){const total=this.steps.length,completed=this.steps.filter((step)=>isAnswered(this.answers[step.id])||this.skipped.has(step.id)).length;return {completed,total,current_index:Math.min(this.position+1,total),status:this.position>=total?'complete':'in_progress'};}
  draft(){return {config_version:this.configuration.config_version,flow_id:this.configuration.flow_id,current_step_id:this.current()?.id??null,answers:{...this.answers},skipped:[...this.skipped]};}
}
