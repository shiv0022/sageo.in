export class BaseError extends Error {
  public readonly timestamp: string;

  constructor(message: string, public readonly meta?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CrawlError extends BaseError {
  constructor(
    message: string,
    public readonly url: string,
    meta?: Record<string, any>
  ) {
    super(message, { ...meta, url });
  }
}

export class EngineError extends BaseError {
  constructor(
    message: string,
    public readonly engineName: string,
    meta?: Record<string, any>
  ) {
    super(message, { ...meta, engineName });
  }
}

export class AIProviderError extends BaseError {
  constructor(
    message: string,
    public readonly providerName: string,
    public readonly code?: string | number,
    meta?: Record<string, any>
  ) {
    super(message, { ...meta, providerName, code });
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta);
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta);
  }
}
