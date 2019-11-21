import { inspect } from './';

(async () => {
  try {
    await inspect();
  } catch (e) {
    const prettyError = `\x1b[31mError: ${e.message}\x1b[0m`.trim();
    console.error(prettyError);
  }
})();
