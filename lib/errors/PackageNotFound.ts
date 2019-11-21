export class PackageNotFound extends Error {
  constructor(packageName: string) {
    super(`JAR for package "${packageName}" was not found`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
