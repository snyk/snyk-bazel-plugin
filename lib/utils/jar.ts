import * as fs from 'fs';
import * as path from 'path';
import { createHash, HexBase64Latin1Encoding } from 'crypto';

import { debug } from './debug';
import { OutOfSync } from '../errors';

export async function getJarForPackage(
  bazelOutput: string,
  packageName: string,
): Promise<Buffer | undefined> {
  const pathToPackageDir: string = path.resolve(
    bazelOutput,
    'external',
    packageName,
    'jar',
  );

  let packageJarDir: string[] = [];

  try {
    packageJarDir = fs.readdirSync(pathToPackageDir);
    const [jar] = packageJarDir.filter((currDir) => currDir.match(/\.jar$/));
    const jarFullPath: string = path.resolve(pathToPackageDir, jar);
    return fs.readFileSync(jarFullPath);
  } catch (e) {
    // HACK: for missing jar file or folder in `external` directory
    if (e.message.match(/no such file or directory/g)) {
      debug('file-folder-missing', e.message);

      return undefined;
    }

    debug(
      'jar-missing',
      `Missing JAR for ${packageName} in ${pathToPackageDir}`,
    );
    throw new OutOfSync();
  }
}

export function calculateShaForJar(
  jarContent: Buffer,
  algo = 'sha1',
  digest: HexBase64Latin1Encoding = 'hex',
): string {
  return createHash(algo)
    .update(jarContent)
    .digest(digest);
}
