class Logger {
  private static getTimestamp(): string {
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  private static logWithTimestamp(level: string, ...args: any[]) {
    console.log(`${this.getTimestamp()} [${level}]`, ...args);
  }

  static debug(...args: any[]) {
    if (process.env.DEBUG) {
      this.logWithTimestamp("DEBUG", ...args);
    }
  }

  static info(...args: any[]) {
    this.logWithTimestamp("INFO", ...args);
  }

  static warn(...args: any[]) {
    this.logWithTimestamp("WARN", ...args);
  }

  static error(...args: any[]) {
    this.logWithTimestamp("ERROR", ...args);
  }

  static log(...args: any[]) {
    console.log(...args);
  }
}

export default Logger;
