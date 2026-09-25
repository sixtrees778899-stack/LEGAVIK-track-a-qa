import { ValidationError } from '../shared/errors.js';

export function validatePlanCatalog(catalog) {
  if(!Number.isInteger(catalog?.plan_catalog_version)||catalog.plan_catalog_version<1)throw new ValidationError('INVALID_PLAN_CATALOG','Plan catalog version is required');
  if(!Array.isArray(catalog.plans)||catalog.plans.length<4)throw new ValidationError('INVALID_PLAN_CATALOG','Four recovery plans are required');
  const ids=new Set();for(const plan of catalog.plans){if(!plan.id||ids.has(plan.id)||!plan.title||!plan.description||!Array.isArray(plan.modules)||!plan.modules.length)throw new ValidationError('INVALID_PLAN','Recovery plan is invalid');ids.add(plan.id);}
  if(!ids.has(catalog.default_plan_id))throw new ValidationError('INVALID_DEFAULT_PLAN','Default recovery plan is missing');return catalog;
}
export function selectRecoveryPlan(catalog,planId,availableModules=[]){validatePlanCatalog(catalog);const plan=catalog.plans.find(item=>item.id===planId);if(!plan)throw new ValidationError('UNKNOWN_PLAN','Recovery plan is not supported');const allowed=new Set(availableModules);if(plan.modules.some(id=>!allowed.has(id)))throw new ValidationError('MISSING_PLAN_MODULE','Recovery plan references an unavailable module');return structuredClone(plan);}
