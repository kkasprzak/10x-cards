export interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class LoggerService {
  private static instance: LoggerService;
  private readonly logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  private log(level: LogEntry["level"], message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logs.push(entry);

    // In development, log to console
    if (import.meta.env.DEV) {
      const logMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
      logMethod(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, context);
    }

    // In production, this would send logs to a proper logging service
    // For now, we'll just keep them in memory
    // TODO: Implement proper log shipping in production
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs.length = 0;
  }
}
