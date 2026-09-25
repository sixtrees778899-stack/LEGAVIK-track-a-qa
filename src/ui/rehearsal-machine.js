import { ValidationError } from '../shared/errors.js';
export const VAULT_STATES=Object.freeze({DRAFT:'Draft',SNAPSHOT:'Snapshot Created',KIT:'Kit Downloaded',REQUIRED:'Rehearsal Required',PASSED:'Rehearsal Passed',VERIFIED:'Verified'});
const TRANSITIONS={[VAULT_STATES.DRAFT]:[VAULT_STATES.SNAPSHOT],[VAULT_STATES.SNAPSHOT]:[VAULT_STATES.KIT],[VAULT_STATES.KIT]:[VAULT_STATES.REQUIRED],[VAULT_STATES.REQUIRED]:[VAULT_STATES.PASSED],[VAULT_STATES.PASSED]:[VAULT_STATES.VERIFIED],[VAULT_STATES.VERIFIED]:[]};
export class RehearsalStateMachine{
  constructor(){this.reset();}
  reset(){this.state=VAULT_STATES.DRAFT;this.snapshotId=null;}
  transition(next,{snapshotId,recoveredSnapshotId,attachmentsVerified=false}={}){
    if(!TRANSITIONS[this.state].includes(next))throw new ValidationError('INVALID_REHEARSAL_TRANSITION',`Cannot move from ${this.state} to ${next}`);
    if(next===VAULT_STATES.SNAPSHOT){if(!snapshotId)throw new ValidationError('SNAPSHOT_REQUIRED','Snapshot evidence is required');this.snapshotId=snapshotId;}
    if(next===VAULT_STATES.PASSED&&(recoveredSnapshotId!==this.snapshotId||!attachmentsVerified))throw new ValidationError('REHEARSAL_EVIDENCE_REQUIRED','Independent recovery evidence is required');
    this.state=next;return this.state;
  }
}
