export class CjasError extends Error {
  constructor(code, message, details = []) { super(message); this.name = this.constructor.name; this.code = code; this.details = details; }
}
export class ValidationError extends CjasError {}
export class CryptoError extends CjasError {}
