export class VaultMemorySession {
  constructor(){this.reset();}
  reset(){this.draft={modules:{},customCategories:[]};this.attachments=new Map();this.artifacts=null;this.password=null;this.dataKey=null;this.vaultId=null;this.versionNumber=0;}
  setSecret(password,dataKey){this.password=password;this.dataKey=dataKey;}
  clearSecrets(){if(this.dataKey instanceof Uint8Array)this.dataKey.fill(0);this.password=null;this.dataKey=null;}
  hasUnsavedWork(){return Object.keys(this.draft.modules).length>0&&!this.artifacts;}
}
