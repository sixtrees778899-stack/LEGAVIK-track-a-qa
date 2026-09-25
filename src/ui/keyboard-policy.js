export const HIGH_RISK_ACTIONS=Object.freeze(new Set(['set-password','confirm-password','create-artifacts','save-kit','save-archive','start-recovery','pass-rehearsal','delete-version']));
export function canTriggerWithEnter(action){return !HIGH_RISK_ACTIONS.has(action);}
