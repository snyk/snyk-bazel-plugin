import { BazelInfo } from '../types';
import { execute } from './sub-process';

export async function bazelInfo(cwd: string): Promise<BazelInfo> {
  const query = 'bazel info';
  const bazelInfoData = await execute(query, [], { cwd });

  const paramsRegexp = /^(release|workspace|output_base|execution_root)/g;
  return (bazelInfoData
    .trim()
    .split('\n')
    .filter((bazelInfo) => bazelInfo.match(paramsRegexp))
    .reduce((accum, curr) => {
      const [key, value] = curr.split(/:\s/g);
      accum[key] = value;
      return accum;
    }, {}) as any) as BazelInfo;
}

export async function bazelQueryForDeps(cwd: string): Promise<string> {
  const query =
    'bazel query \'deps(//...) except kind("source file", deps(//...))\' --noimplicit_deps --output package';
  return await execute(query, [], { cwd });
}
