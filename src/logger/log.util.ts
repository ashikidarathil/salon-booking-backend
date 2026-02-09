import { logger } from '../config/logger';

type LogMeta = Record<string, unknown>;

export const logInfo = (message: string, meta?: LogMeta): void => {
  if (meta && Object.keys(meta).length > 0) {
    logger.info(`${message} ${JSON.stringify(meta)}`);
  } else {
    logger.info(message);
  }
};

export const logWarn = (message: string, meta?: LogMeta): void => {
  if (meta && Object.keys(meta).length > 0) {
    logger.warn(`${message} ${JSON.stringify(meta)}`);
  } else {
    logger.warn(message);
  }
};

export const logDebug = (message: string, meta?: LogMeta): void => {
  if (meta && Object.keys(meta).length > 0) {
    logger.debug(`${message} ${JSON.stringify(meta)}`);
  } else {
    logger.debug(message);
  }
};

export const logError = (message: string, meta?: LogMeta): void => {
  if (meta && Object.keys(meta).length > 0) {
    logger.error(`${message} ${JSON.stringify(meta)}`);
  } else {
    logger.error(message);
  }
};
