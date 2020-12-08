const chokidar = require('chokidar');
const { promisify } = require('util');
const { resolve } = require('path');
const chalk = require('chalk');
const exec = promisify(require('child_process').exec);

const watcher = chokidar.watch(resolve(process.cwd(), 'dist'), {
  ignoreInitial: true,
});

watcher.on('change', async (event) => {
  try {
    const cmd = await exec('yarn code');
    const stdoutArr = cmd.stdout.split('\n');
    stdoutArr.splice(0, 1);
    console.log(chalk.redBright(stdoutArr.join('\n')));
  } catch (e) {
    console.error('error:', chalk.greenBright(e));
  }
});
