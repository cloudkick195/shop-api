import { green, red, yellow, cyan } from 'chalk';

export const LoggerMethods: { [key: string]: any } = {
  post: green,
  get: cyan,
  patch: yellow,
  put: yellow,
  delete: red
};
