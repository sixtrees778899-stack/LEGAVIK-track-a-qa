import { ValidationError } from '../shared/errors.js';

const STEP_TYPES = new Set(['text','choice','attachment','custom-fields']);
export function buildWizardConfiguration(flow, templates, content = {}) {
  if (!flow || !Number.isInteger(flow.config_version) || flow.config_version < 1) throw new ValidationError('INVALID_WIZARD_CONFIG','config_version is required');
  if (!Array.isArray(flow.modules)) throw new ValidationError('INVALID_WIZARD_CONFIG','modules must be an array');
  const templateMap = new Map(templates.map((template) => [template.module_id, template]));
  const modules = flow.modules.filter((entry) => entry.enabled).sort((a,b)=>a.order-b.order).map((entry) => {
    const template=templateMap.get(entry.template); if(!template)throw new ValidationError('MISSING_TEMPLATE',`Template not found: ${entry.template}`);
    if(!Array.isArray(template.steps)||template.steps.length===0)throw new ValidationError('INVALID_TEMPLATE',`Template has no steps: ${entry.template}`);
    for(const step of template.steps){if(!step.id||!STEP_TYPES.has(step.type)||typeof step.required!=='boolean'||typeof step.skip_allowed!=='boolean')throw new ValidationError('INVALID_STEP',`Invalid step in ${entry.template}`);if(step.type==='choice'&&(!Array.isArray(step.options)||step.options.length<2))throw new ValidationError('INVALID_OPTIONS',`Choice step requires options: ${step.id}`);}
    return {...template,order:entry.order,title:content[template.title_key]??template.title_key,steps:template.steps.map((step)=>({...step,label:content[step.label_key]??step.label_key}))};
  });
  const stepIds=new Set();for(const module of modules)for(const step of module.steps){if(stepIds.has(step.id))throw new ValidationError('DUPLICATE_STEP',`Duplicate step ID: ${step.id}`);stepIds.add(step.id);}
  return {config_version:flow.config_version,flow_id:flow.flow_id,modules};
}
