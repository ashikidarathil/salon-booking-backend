import { logger } from '../config/logger';

type LogMeta = Record<string, unknown>;

export const logInfo = (message: string, meta?: LogMeta): void => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: LogMeta): void => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: LogMeta): void => {
  logger.debug(message, meta);
};

export const logError = (message: string, meta?: LogMeta): void => {
  logger.error(message, meta);
};
