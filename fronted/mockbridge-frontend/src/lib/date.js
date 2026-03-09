function pad(value) {
  return String(value).padStart(2, '0');
}

export function toUtcLocalDateTimeString(localDateTimeValue) {
  if (!localDateTimeValue) return '';

  const localDate = new Date(localDateTimeValue);
  if (Number.isNaN(localDate.getTime())) return '';

  return [
    localDate.getUTCFullYear(),
    '-',
    pad(localDate.getUTCMonth() + 1),
    '-',
    pad(localDate.getUTCDate()),
    'T',
    pad(localDate.getUTCHours()),
    ':',
    pad(localDate.getUTCMinutes()),
    ':',
    pad(localDate.getUTCSeconds()),
  ].join('');
}

export function utcLocalDateTimeToLocalDate(utcLocalDateTime) {
  if (!utcLocalDateTime) return null;
  const date = new Date(`${utcLocalDateTime}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatUtcToLocal(utcLocalDateTime, options) {
  const date = utcLocalDateTimeToLocalDate(utcLocalDateTime);
  if (!date) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
}

export function formatUtcLabel(utcLocalDateTime) {
  if (!utcLocalDateTime) return '-';
  return `${utcLocalDateTime} UTC`;
}

export function toDateTimeLocalInputValue(date) {
  if (!date) return '';

  const safeDate = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(safeDate.getTime())) return '';

  return [
    safeDate.getFullYear(),
    '-',
    pad(safeDate.getMonth() + 1),
    '-',
    pad(safeDate.getDate()),
    'T',
    pad(safeDate.getHours()),
    ':',
    pad(safeDate.getMinutes()),
  ].join('');
}
