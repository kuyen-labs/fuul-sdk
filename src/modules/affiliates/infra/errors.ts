export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AddressInUseError extends Error {
  public readonly address: string;

  constructor(address: string) {
    super(`Address already registered.`);
    this.name = 'AddressInUseError';
    this.address = address;
  }
}

export class CodeInUseError extends Error {
  public readonly code: string;

  constructor(code: string) {
    super(`Code already registered.`);
    this.name = 'CodeInUseError';
    this.code = code;
  }
}

export class InvalidSignatureError extends Error {
  constructor() {
    super(`Invalid signature provided`);
    this.name = 'InvalidSignatureError';
  }
}
