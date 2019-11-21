import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import { debug } from './debug';
import { MavenDependency } from '../types';
import { PackageNotFound } from '../errors';

export async function findPackageInMavenCentralBySha(
  packageName: string,
  jarSha: string,
): Promise<MavenDependency> {
  const qs = new URLSearchParams({ q: `1:${jarSha}` }).toString();

  let body: any = {};

  try {
    const req = await fetch(`https://search.maven.org/solrsearch/select?${qs}`);
    body = await req.json();
  } catch (e) {
    debug('maven-request', `Failed for package "${packageName}"`);
    debug('maven-request', e.message);
  }

  const [jarMetadata] = body?.response?.docs || [];

  if (!jarMetadata) {
    throw new PackageNotFound(packageName);
  }

  const { g: group, a: artifact, v: version } = jarMetadata;

  return { group, artifact, version };
}
