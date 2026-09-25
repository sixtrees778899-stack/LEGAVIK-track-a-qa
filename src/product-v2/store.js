import { clone } from './model.js';

export class MemoryProductStore{
  #draft;
  constructor(initialDraft){this.#draft=clone(initialDraft);}
  read(){return clone(this.#draft);}
  commit(next,expectedRevision){if(this.#draft.version.status==='GENERATED')throw new Error('GENERATED_VERSION_IMMUTABLE');if(expectedRevision!==this.#draft.draft_revision)throw new Error('STALE_DRAFT_REVISION');if(next.draft_revision!==expectedRevision+1)throw new Error('INVALID_REVISION_TRANSITION');this.#draft=clone(next);return this.read();}
  replaceForImport(next){this.#draft=clone(next);return this.read();}
}
