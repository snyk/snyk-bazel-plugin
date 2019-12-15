import * as fs from 'fs';
import * as tmp from 'tmp';

import { MavenDependency } from '../types';

// When it's gonna be true snyk plugin
// we will need to clean tmp folders and files
// TODO: tmp.setGracefulCleanup();

function buildPom(
  groupId: string,
  projectName: string,
  packagesArr: MavenDependency[],
) {
  const xmlHeader = `<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">

  <modelVersion>4.0.0</modelVersion>

  <groupId>${groupId}</groupId>
  <artifactId>${projectName}</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>Test project</name>
  <description>Test project for the Bazel CLI plugin</description>
  
  <repositories>
    <repository>
      <id>atlassian</id>
      <url>https://packages.atlassian.com/maven/public</url>
    </repository>
  </repositories>

  <dependencies>`;

  const xmlFooter = `  </dependencies>

</project>`;

  let result = xmlHeader;

  packagesArr.forEach(({ group, artifact, version }) => {
    result += `
    <dependency>
      <groupId>${group}</groupId>
      <artifactId>${artifact}</artifactId>
      <version>${version}</version>
    </dependency>
`;
  });

  result += xmlFooter;

  return result;
}

export function createPom(
  groupId: string,
  projectName: string,
  mavenPackagesList: MavenDependency[],
): string {
  const tmpPom = tmp.fileSync({ postfix: '-snyk-pom.xml' });

  fs.writeFileSync(
    tmpPom.name,
    buildPom(groupId, projectName, mavenPackagesList),
  );

  return tmpPom.name;
}
