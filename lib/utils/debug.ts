import * as debugLib from 'debug';

const PLUGIN_NAME = 'snyk-bazel-plugin';

export function debug(namespace: string, message: string) {
  return debugLib(PLUGIN_NAME).extend(namespace)(message);
}
