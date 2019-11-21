export class OutOfSync extends Error {
  private static ERROR_MESSAGE =
    'Seems like a project missing build target(s). Try running `bazel build`';

  constructor() {
    super(OutOfSync.ERROR_MESSAGE);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
