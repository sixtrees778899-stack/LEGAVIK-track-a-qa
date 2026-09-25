export class KnowledgeChecker { check(_knowledgeMap){throw new Error('KnowledgeChecker implementation required');} }
export class RecoveryReviewEngine { review(_knowledgeMap){throw new Error('RecoveryReviewEngine is deferred');} }
export class RiskDiscovery { discover(_knowledgeMap){throw new Error('RiskDiscovery is deferred');} }
export class SuggestionEngine { suggest(_issues){throw new Error('SuggestionEngine is deferred');} }

export const advisorBoundaryPolicy=Object.freeze({deterministic_only:true,external_ai_calls:false,plaintext_upload:false,status:'extension-boundary-only'});
