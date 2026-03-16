export function normalizeApiError(error) {
  if (error?.isNormalized) {
    return error;
  }

  if (error?.response) {
    const { data = {}, status, statusText } = error.response;

    return {
      status,
      error: data.error || statusText || 'Request failed',
      message: data.message || data.error || 'Something went wrong.',
      path: data.path || '',
      timestamp: data.timestamp || null,
      isNetworkError: false,
      isNormalized: true,
    };
  }

  if (error?.request) {
    return {
      status: 0,
      error: 'Network Error',
      message:
        'Unable to reach the API gateway. Make sure the gateway and dependent services are running.',
      path: '',
      timestamp: null,
      isNetworkError: true,
      isNormalized: true,
    };
  }

  return {
    status: 0,
    error: 'Unexpected Error',
    message: error?.message || 'Unexpected error occurred.',
    path: '',
    timestamp: null,
    isNetworkError: false,
    isNormalized: true,
  };
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const parsed = normalizeApiError(error);
  return parsed.message || fallback;
}