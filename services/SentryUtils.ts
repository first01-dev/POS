import * as Sentry from '@sentry/nextjs';

type Severity = 'info' | 'warning' | 'error' | 'fatal' | 'debug' | 'log';

/**
 * Sends an event to Sentry with the specified message and severity level.
 * @param message - The message to send to Sentry.
 * @param type - The severity level of the event.
 */
const SentryEvent = (message:string, type: Severity) => { 
    Sentry.captureEvent({
        message,
        level: type,
    });
}

export default SentryEvent;