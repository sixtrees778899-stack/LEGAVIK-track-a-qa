import { CryptoError, ValidationError } from '../shared/errors.js';
import { utf8 } from '../shared/encoding.js';

const subtle=globalThis.crypto?.subtle;
function requireSalt(salt){if(!(salt instanceof Uint8Array)||salt.byteLength<16||salt.byteLength>64)throw new ValidationError('INVALID_KDF_SALT','KDF salt must be 16-64 bytes');}

export class KdfProvider {
  constructor(algorithm){this.algorithm=algorithm;}
  capability(){return {algorithm:this.algorithm,available:false,reason:'Provider has no implementation'};}
  validateParameters(_parameters){throw new Error('validateParameters must be implemented');}
  async deriveKey(_password,_salt,_parameters){throw new Error('deriveKey must be implemented');}
}

export class Pbkdf2Provider extends KdfProvider {
  constructor({minIterations=100000,maxIterations=5000000}={}){super('PBKDF2-HMAC-SHA-256');this.minIterations=minIterations;this.maxIterations=maxIterations;}
  capability(){return {algorithm:this.algorithm,available:Boolean(subtle),native_webcrypto:Boolean(subtle),wasm:false};}
  validateParameters(parameters){const iterations=parameters?.iterations;if(!Number.isInteger(iterations)||iterations<this.minIterations||iterations>this.maxIterations)throw new ValidationError('INVALID_KDF_PARAMETERS',`PBKDF2 iterations must be ${this.minIterations}-${this.maxIterations}`);if(parameters.hash!=='SHA-256')throw new ValidationError('INVALID_KDF_PARAMETERS','PBKDF2 hash must be SHA-256');return true;}
  async deriveKey(password,salt,parameters){if(typeof password!=='string'||password.length===0)throw new ValidationError('INVALID_PASSWORD','Recovery Password is required');requireSalt(salt);this.validateParameters(parameters);if(!subtle)throw new CryptoError('KDF_UNAVAILABLE','Web Crypto PBKDF2 is unavailable');const material=await subtle.importKey('raw',utf8.encode(password.normalize('NFC')),'PBKDF2',false,['deriveBits']);return new Uint8Array(await subtle.deriveBits({name:'PBKDF2',salt,iterations:parameters.iterations,hash:'SHA-256'},material,256));}
}

export class Argon2idProvider extends KdfProvider {
  constructor(implementation=null){super('Argon2id');this.implementation=implementation;}
  capability(){return {algorithm:this.algorithm,available:typeof this.implementation==='function',native_webcrypto:false,wasm:typeof this.implementation==='function',reason:this.implementation?'Injected audited implementation':'No audited local Argon2id implementation installed'};}
  validateParameters(parameters){const {memory_kib,iterations,parallelism}=parameters??{};if(!Number.isInteger(memory_kib)||memory_kib<8192||memory_kib>524288)throw new ValidationError('INVALID_KDF_PARAMETERS','Argon2id memory_kib must be 8192-524288');if(!Number.isInteger(iterations)||iterations<1||iterations>10)throw new ValidationError('INVALID_KDF_PARAMETERS','Argon2id iterations must be 1-10');if(!Number.isInteger(parallelism)||parallelism<1||parallelism>8)throw new ValidationError('INVALID_KDF_PARAMETERS','Argon2id parallelism must be 1-8');return true;}
  async deriveKey(password,salt,parameters){if(typeof password!=='string'||password.length===0)throw new ValidationError('INVALID_PASSWORD','Recovery Password is required');requireSalt(salt);this.validateParameters(parameters);if(!this.implementation)throw new CryptoError('KDF_UNAVAILABLE','Argon2id is unavailable; silent downgrade is forbidden');const result=await this.implementation({password:password.normalize('NFC'),salt,parameters,outputLength:32});if(!(result instanceof Uint8Array)||result.length!==32)throw new CryptoError('KDF_INVALID_OUTPUT','Argon2id provider returned invalid output');return result;}
}

export function detectKdfCapabilities(providers){return providers.map((provider)=>provider.capability());}
