export class ReviewRevisionTracker{
  constructor(){this.draftRevision=0;this.reviewRevision=null;}
  changed(){this.draftRevision++;this.reviewRevision=null;return this.draftRevision;}
  reviewed(){this.reviewRevision=this.draftRevision;return this.reviewRevision;}
  isCurrent(){return this.reviewRevision!==null&&this.reviewRevision===this.draftRevision;}
}
