// Server logs go to CloudWatch through Amplify's hosting compute logs. One JSON object per line, with an
// `event` name, so a metric filter such as { $.event = "request_error" } can count them and raise an alarm.
// Never pass secrets, cookies, full URLs with query strings, or member data here.

type Fields = Record<string, string | number | boolean | null | undefined>;

export function logError(event: string, fields: Fields = {}) {
  console.error(JSON.stringify({ level: 'error', event, time: new Date().toISOString(), ...fields }));
}

/** The message only, cut short. A stack can carry file paths and query text that the line does not need. */
export function errorMessage(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return message.slice(0, 300);
}
