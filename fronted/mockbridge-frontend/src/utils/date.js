export function utcDateTimeToLocalLabel(utcValue) {
  if (!utcValue) {
    return '—';
  }

  const date = new Date(`${utcValue}Z`);

  if (Number.isNaN(date.getTime())) {
    return utcValue;
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function utcRangeToLocalLabel(startUtc, endUtc) {
  if (!startUtc || !endUtc) {
    return '—';
  }

  const startDate = new Date(`${startUtc}Z`);
  const endDate = new Date(`${endUtc}Z`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${startUtc} - ${endUtc}`;
  }

  const sameDay =
    startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${startDate.toLocaleDateString([], {
      dateStyle: 'medium',
    })} · ${startDate.toLocaleTimeString([], {
      timeStyle: 'short',
    })} - ${endDate.toLocaleTimeString([], {
      timeStyle: 'short',
    })}`;
  }

  return `${startDate.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })} - ${endDate.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })}`;
}

export function localInputToUtcNaiveString(localValue) {
  if (!localValue) {
    return '';
  }

  const date = new Date(localValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 19);
}

export function getMinLocalDateTimeInput(minutesAhead = 15) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesAhead);
  now.setSeconds(0, 0);

  const timezoneOffset = now.getTimezoneOffset();
  const adjusted = new Date(now.getTime() - timezoneOffset * 60000);

  return adjusted.toISOString().slice(0, 16);
}
