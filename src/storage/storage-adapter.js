import { ValidationError } from '../shared/errors.js';
export class StorageAdapter {
  async putCiphertext(_bytes,_metadata){throw new Error('putCiphertext must be implemented');}
  async getCiphertext(_locatorSet,_options){throw new Error('getCiphertext must be implemented');}
  async probe(_locatorSet){throw new Error('probe must be implemented');}
}
export class LocalMockAdapter extends StorageAdapter {
  constructor(){super();this.store=new Map();}
  async putCiphertext(bytes,{id}){if(!(bytes instanceof Uint8Array)||!id)throw new ValidationError('INVALID_STORAGE_INPUT','Ciphertext and ID are required');this.store.set(id,new Uint8Array(bytes));return {adapter:'local-mock-v1',locators:[id]};}
  async getCiphertext(locatorSet){const id=locatorSet?.locators?.[0],value=this.store.get(id);if(!value)throw new ValidationError('NOT_FOUND','Ciphertext not found');return new Uint8Array(value);}
  async probe(locatorSet){return {available:this.store.has(locatorSet?.locators?.[0])};}
}
