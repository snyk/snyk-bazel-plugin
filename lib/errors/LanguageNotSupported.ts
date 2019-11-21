export class LanguageNotSupported extends Error {
  private static ERROR_MESSAGE =
    'Other ecosystems except Java are currently not yet supported';

  constructor() {
    super(LanguageNotSupported.ERROR_MESSAGE);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
