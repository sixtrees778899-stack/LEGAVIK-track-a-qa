import { ValidationError } from '../shared/errors.js';
export class LocalVersionHistory{
  constructor(){this.items=[];}
  add({version,snapshotId,createdAt,status='Rehearsal Required',summary,kitName,archiveName,current=true}){if(this.items.some(item=>item.snapshot_id===snapshotId))throw new ValidationError('DUPLICATE_VERSION','Version already exists');for(const item of this.items)item.current=false;const value={version,snapshot_id:snapshotId,created_at:createdAt,status,summary,kit_name:kitName,archive_name:archiveName,current};this.items.push(value);return structuredClone(value);}
  markVerified(snapshotId){const item=this.items.find(value=>value.snapshot_id===snapshotId);if(!item)throw new ValidationError('UNKNOWN_VERSION','Version is not in history');item.status='Verified';return structuredClone(item);}
  list(){return this.items.map(item=>structuredClone(item));}
}
