import { red, green, cyan, yellow } from 'chalk';

function logError(messsage: string):void {
  red(messsage);
}

function logSuccess(messsage: string):void {
  green(messsage);
}

function logInfo(messsage: string):void {
  cyan(messsage);
}

function logWarning(messsage: string):void {
  yellow(messsage);
}

export { logError, logSuccess, logInfo, logWarning };
