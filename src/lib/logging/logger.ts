export type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private minLevel: LogLevel = "info";

  constructor() {
    const envLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLevel && ["debug", "info", "warn", "error"].includes(envLevel)) {
      this.minLevel = envLevel;
    } else if (process.env.NODE_ENV === "development") {
      this.minLevel = "debug";
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    if (process.env.NODE_ENV === "production") {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(meta || {}),
      });
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  public debug(message: string, meta?: any): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  public info(message: string, meta?: any): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  public warn(message: string, meta?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  public error(message: string, error?: Error | unknown, meta?: any): void {
    if (this.shouldLog("error")) {
      const errMeta = error instanceof Error 
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : { rawError: error };
      console.error(this.formatMessage("error", message, { ...errMeta, ...(meta || {}) }));
    }
  }
}

export const logger = new Logger();
