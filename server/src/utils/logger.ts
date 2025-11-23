import { createLogger, format, transports } from 'winston';
// Apply custom colors to the logger
import * as winston from 'winston';

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue'
    }
};

const logger = createLogger({
    levels: customLevels.levels,
    format: format.combine(
        format.colorize({ all: true }),  // Colorize all log levels
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Add a timestamp
        format.errors({ stack: true }), // Add this to include stack traces
        format.printf(({ timestamp, level, message, stack }) => {
            // Include stack trace in the log output if available
            if (stack) {
                return `${timestamp} ${level}: ${message}\n${stack}`;
            }
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),  // Output logs to the console
        new transports.File({ filename: 'logs/error.log', level: 'error' }),  // Errors logged to error.log
        new transports.File({ filename: 'logs/combined.log' })  // All logs (info, warn, error) saved to combined.log
    ]
});

winston.addColors(customLevels.colors);

export default logger;
