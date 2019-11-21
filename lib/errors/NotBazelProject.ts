export class NotBazelProject extends Error {
  private static ERROR_MESSAGE =
    "Folder is missing `WORKSPACE` file. Try running from project's root folder";

  constructor() {
    super(NotBazelProject.ERROR_MESSAGE);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
