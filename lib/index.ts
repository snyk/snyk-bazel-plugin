import * as fs from 'fs';
import * as path from 'path';
import * as findInFile from 'find-in-files';

import { debug } from './utils/debug';
import { createPom } from './utils/pom-builder';
import { bazelInfo, bazelQueryForDeps } from './utils/bazel';
import { LanguageNotSupported, NotBazelProject } from './errors';
import { calculateShaForJar, getJarForPackage } from './utils/jar';
import { findPackageInMavenCentralBySha } from './utils/maven-central';
import {
  BazelInfo,
  DependenciesResult,
  PluginOptions,
  PluginResult,
} from './types';

function isBazleProject(root: string, targetFile: string): boolean {
  return fs.existsSync(path.resolve(root, targetFile));
}

async function isLanguageSupported() {
  // Find all BUILD files that have `java` related rules in them
  const javaBuildFiled = await findInFile.find(
    'java_library|java_import',
    process.cwd(),
    'BUILD(.bzl)?$',
  );
  return javaBuildFiled && Object.keys(javaBuildFiled).length > 0;
}

async function buildDependenciesList(
  root: string,
  bazelGenfilesLocation: string,
): Promise<DependenciesResult> {
  const bazelDepsList: string = await bazelQueryForDeps(root);

  const packagesList: string[] = bazelDepsList
    .split('\n')
    .filter((line) => line.match(/^@/g))
    .map((packageName: string) => {
      return packageName
        .replace('@', '')
        .substring(0, packageName.indexOf('/') - 1);
    });

  debug('build-deps', JSON.stringify(packagesList, null, 2));

  const packageSHAList = await Promise.all(
    packagesList.map(async (singlePackage) => {
      const jarContent = await getJarForPackage(
        bazelGenfilesLocation,
        singlePackage,
      );
      return {
        packageName: singlePackage,
        sha1: calculateShaForJar(jarContent),
      };
    }),
  );

  debug('build-deps', JSON.stringify(packageSHAList, null, 2));

  const deps: DependenciesResult = {
    succeed: [],
    failed: [],
  };

  const tmp: any[] = await Promise.all(
    packageSHAList.map(async ({ packageName, sha1 }) => {
      try {
        return await findPackageInMavenCentralBySha(packageName, sha1);
      } catch (e) {
        return { packageName, sha1 };
      }
    }),
  );

  tmp.forEach((result: any) => {
    if (result.sha1) {
      deps.failed.push(result);
    } else {
      deps.succeed.push(result);
    }
  });

  debug('build-deps', JSON.stringify(deps, null, 2));
  debug('build-deps-failed', JSON.stringify(deps.failed, null, 2));

  return deps;
}

function createFakePom(bazenInfo: BazelInfo, deps: DependenciesResult) {
  const groupId = bazenInfo.execution_root.substring(
    bazenInfo.execution_root.lastIndexOf('/') + 1,
  );
  const artifactId = bazenInfo.workspace.substring(
    bazenInfo.workspace.lastIndexOf('/') + 1,
  );

  debug('pom-creating', 'Started creating POM');
  const pomLocation = createPom(groupId, artifactId, deps.succeed);
  console.log(`\x1b[32m${pomLocation}\x1b[0m`);
  debug('pom-creating', 'Finished creating POM');
}

export async function inspect(
  root: string = process.cwd(),
  targetFile = 'WORKSPACE',
  options: PluginOptions = { fakePom: true },
): Promise<PluginResult> {
  if (!isBazleProject(root, targetFile)) {
    throw new NotBazelProject();
  }

  if (!(await isLanguageSupported())) {
    throw new LanguageNotSupported();
  }

  const bazelParams: BazelInfo = await bazelInfo(root);

  const deps: DependenciesResult = await buildDependenciesList(
    root,
    bazelParams.output_base,
  );

  if (options.fakePom) {
    createFakePom(bazelParams, deps);
  }

  return {
    plugin: {
      name: 'snyk-bazel-plugin',
      runtime: bazelParams.release,
    },
    package: deps.succeed,
    failedPackage: deps.failed,
  };
}
