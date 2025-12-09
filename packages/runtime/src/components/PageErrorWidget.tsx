import type { ReactNode } from 'react';
import { Alert } from '@lumia/components';
import type { PageConfigError, ResourceConfigError } from '../validation';

/**
 * Props for the PageErrorWidget component.
 */
export type PageErrorWidgetProps = {
  /** The validation error from page/resource config validation */
  error: PageConfigError | ResourceConfigError;
  /** Custom title to override the default */
  title?: string;
  /** Custom description to override the default */
  description?: string;
  /** Additional content to render below the error info */
  children?: ReactNode;
  /** Additional CSS class names */
  className?: string;
};

/**
 * Check if error is a PageConfigError.
 */
const isPageError = (
  error: PageConfigError | ResourceConfigError,
): error is PageConfigError => error.type === 'page-config-error';

/**
 * Get the identifier from the error object.
 */
const getErrorId = (error: PageConfigError | ResourceConfigError): string =>
  isPageError(error) ? error.pageId : error.resourceName;

/**
 * Full-page error widget displayed when page-level config validation fails.
 * Shows a graceful error message instead of a white screen/crash.
 *
 * In development mode, includes detailed validation issue information.
 * Customizable via props for title, description, and children slot.
 */
export function PageErrorWidget({
  error,
  title = 'Configuration Error',
  description,
  children,
  className,
}: PageErrorWidgetProps) {
  /* eslint-disable no-undef */
  const isDev =
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  /* eslint-enable no-undef */

  const errorId = getErrorId(error);
  const errorType = isPageError(error) ? 'page' : 'resource';
  const defaultDescription = `The ${errorType} configuration is invalid for "${errorId}". Please check the configuration and try again.`;

  return (
    <div data-testid="page-error-widget" className={className}>
      <Alert
        variant="error"
        title={title}
        description={description ?? defaultDescription}
        role="alert"
      >
        {isDev && error.issues.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium mb-1 text-red-800">
              Validation Issues:
            </p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
              {error.issues.map((issue, index) => (
                <li key={index}>
                  <code className="text-xs bg-red-100 px-1 rounded">
                    {issue.path.join('.')}
                  </code>
                  : {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {children}
      </Alert>
    </div>
  );
}
