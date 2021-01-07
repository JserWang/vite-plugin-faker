import chalk from 'chalk';

const colorful = (flag: LOG_FLAG) => {
  switch (flag) {
    case LOG_FLAG.INFO:
      return chalk.greenBright;
    case LOG_FLAG.WARNING:
      return chalk.yellowBright;
    case LOG_FLAG.ERROR:
      return chalk.redBright;
  }
};

enum LOG_FLAG {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  info(msg: string) {
    this.log(LOG_FLAG.INFO, msg);
  }

  warning(msg: string) {
    this.log(LOG_FLAG.WARNING, msg);
  }

  error(msg: string) {
    this.log(LOG_FLAG.ERROR, msg);
  }

  private log(flag: LOG_FLAG, msg: string) {
    console.log(colorful(flag)(`[${this.prefix}:${flag}]`), msg);
  }
}

export const logger = new Logger('vite-plugin-faker');
