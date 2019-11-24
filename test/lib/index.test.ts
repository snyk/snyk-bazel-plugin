import * as fs from 'fs';
import * as path from 'path';

import { inspect } from '../../lib';
import { PluginResult } from '../../lib/types';

jest.setTimeout(20000);

test('Returns correct deps list for Bazel project', async () => {
  const pathToProject = path.resolve('test', 'fixtures', 'example-project');
  const pluginResult: PluginResult = await inspect(pathToProject, undefined, {
    fakePom: false,
  });

  const pathToResult = path.resolve('test', 'fixtures', 'example-project.json');
  const resultStub = JSON.parse(
    fs.readFileSync(pathToResult, { encoding: 'utf-8' }),
  );

  expect(pluginResult.package).toEqual(resultStub.package);
});
