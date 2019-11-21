export interface PluginOptions {
  fakePom: boolean;
}

export interface PluginResult {
  plugin: PluginMetadata;
  package: MavenDependency[];
  failedPackage: FailedMavenDependency[];
}

export interface PluginMetadata {
  name: string;
  runtime: string;
}

export interface MavenDependency {
  group: string;
  artifact: string;
  version: string;
}

export interface FailedMavenDependency {
  packageName: string;
  sha1: string;
}

export interface DependenciesResult {
  succeed: MavenDependency[];
  failed: FailedMavenDependency[];
}

export interface BazelInfo {
  release: string;
  workspace: string;
  output_base: string;
  execution_root: string;
}
