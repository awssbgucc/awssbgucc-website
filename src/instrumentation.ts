import type { Instrumentation } from 'next';
import { errorMessage, logError } from '@/lib/log';

/**
 * Every error thrown while rendering a page, running a server action or answering a route, as one searchable line.
 * The digest is the "Reference" the dashboard's error page shows. The query string is dropped: it can hold codes
 * or search terms.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logError('request_error', {
    digest: (error as { digest?: string } | null)?.digest,
    method: request.method,
    path: request.path.split('?')[0],
    route: context.routePath,
    type: context.routeType,
    message: errorMessage(error),
  });
};
