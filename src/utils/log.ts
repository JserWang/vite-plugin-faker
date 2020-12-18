import chalk from 'chalk';

const LOG_INFO = chalk.greenBright('[vite-plugin-faker-info]:');

const LOG_WARNING = chalk.yellowBright('[vite-plugin-faker-warning]:');

const LOG_ERROR = chalk.redBright('[vite-plugin-faker-error]:');

export const logInfo = (msg: string) => {
  console.log(LOG_INFO, msg);
};

export const logWarning = (msg: string) => {
  console.log(LOG_WARNING, msg);
};

export const logError = (msg: string) => {
  console.log(LOG_ERROR, msg);
};
