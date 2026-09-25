import { cryptoEngine } from '../crypto/crypto-engine.js';
import { parseSnapshot } from '../snapshot/snapshot-builder.js';
import { utf8 } from '../shared/encoding.js';
import { CryptoError } from '../shared/errors.js';

export class RecoveryService {
  constructor({kitBuilder,storageAdapter,kdfProvider}){this.kitBuilder=kitBuilder;this.storageAdapter=storageAdapter;this.kdfProvider=kdfProvider;}
  async recover({kitBytes,password,expectedSnapshotId,expectedCiphertextSha256,envelopeDecoder}){
    const dataKey=await this.kitBuilder.unwrapKit({kitBytes,password,kdfProvider:this.kdfProvider,expectedSnapshotId,expectedCiphertextSha256});
    try{
      const payload=this.kitBuilder.parseKit(kitBytes);const ciphertext=await this.storageAdapter.getCiphertext({locators:payload.storage_locators});if(await cryptoEngine.hashHex(ciphertext)!==expectedCiphertextSha256)throw new CryptoError('CIPHERTEXT_HASH_MISMATCH','Encrypted Vault integrity check failed');
      const envelope=envelopeDecoder(ciphertext);const plaintext=await cryptoEngine.decryptSnapshot(envelope,{dataKey});return await parseSnapshot(utf8.decode(plaintext));
    }finally{cryptoEngine.wipeSensitiveReference(dataKey);}
  }
}
