import * as treeKill from 'tree-kill';
import * as childProcess from 'child_process';

import { debug } from './debug';

// Disabled by default, to set run the CLI as `PROC_TIMEOUT=100000 snyk ...`
const TIMEOUT = process.env.PROC_TIMEOUT || '0';
const PROC_TIMEOUT = parseInt(TIMEOUT, 10);

export async function execute(
  command: string,
  args: string[] = [],
  options?: { cwd?: string },
): Promise<string> {
  const spawnOptions: childProcess.SpawnOptions = { shell: true };

  if (options && options.cwd) {
    spawnOptions.cwd = options.cwd;
  }

  const fullCommand = command + ' ' + args.join(' ');

  return new Promise((resolve, reject) => {
    const out = {
      stdout: '',
      stderr: '',
    };

    const proc = childProcess.spawn(command, args, spawnOptions) as any;

    if (PROC_TIMEOUT !== 0) {
      setTimeout(() => {
        out.stderr =
          out.stderr +
          'Process timed out. To set longer timeout run with `PROC_TIMEOUT=value_in_ms`\n';
        return treeKill(proc.pid);
      }, PROC_TIMEOUT);
    }

    proc.stdout.on('data', (data: Buffer) => {
      const strData = data.toString();
      out.stdout = out.stdout + strData;
      strData.split('\n').forEach((str) => {
        debug('sub-process', str);
      });
    });
    proc.stderr.on('data', (data: Buffer) => {
      const strData = data.toString();
      out.stderr = out.stderr + strData;
      strData.split('\n').forEach((str) => {
        debug('sub-process', str);
      });
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        const errorMessage =
          `>>> command: ${fullCommand} ` +
          (code ? `>>> exit code: ${code} ` : '') +
          (out.stdout ? `>>> stdout: ${out.stdout.trim()} ` : '') +
          (out.stderr ? `>>> stderr: ${out.stderr.trim()}` : 'null');

        return reject(new Error(errorMessage));
      }

      if (out.stderr) {
        debug(
          'sub-process',
          `subprocess exit code = 0, but stderr was not empty: ${out.stderr.trim()}`,
        );
      }

      resolve(out.stdout.trim());
    });
  });
}
