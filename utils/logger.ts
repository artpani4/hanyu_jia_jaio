// utils/logger.ts
// A simplified logger implementation

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level (can be changed at runtime)
let currentLevel = LogLevel.INFO;

// Set the minimum log level
export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

// Format the current timestamp
function getTimestamp(): string {
  return new Date().toISOString();
}

// Basic logger functions
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (currentLevel <= LogLevel.INFO) {
      console.info(`[${getTimestamp()}] [INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(`[${getTimestamp()}] [WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...args);
    }
  },
};

// Export log level enum for external use
export { LogLevel };
