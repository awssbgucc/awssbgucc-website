// Stops database tests from ever writing to a shared database.
const url = process.env.DATABASE_URL ?? '';
const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
})();

if (!['localhost', '127.0.0.1'].includes(host)) {
  throw new Error('Integration tests need DATABASE_URL to point at a local database. Refusing to run.');
}
