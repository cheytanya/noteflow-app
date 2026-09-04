// Date utilities for NoteFlow smart deadlines and reminders

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function getRelativeTimeString(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (isPast) {
    if (minutes < 1) return 'Overdue by less than a minute';
    if (hours < 1) return `Overdue by ${minutes}m`;
    if (days < 1) {
      const remainingMins = minutes % 60;
      return `Overdue by ${hours}h ${remainingMins}m`;
    }
    return `Overdue by ${days} day${days > 1 ? 's' : ''}`;
  } else {
    if (minutes < 1) return 'Due in less than a minute';
    if (hours < 1) return `Due in ${minutes}m`;
    if (days < 1) {
      const remainingMins = minutes % 60;
      return `Due in ${hours}h ${remainingMins}m`;
    }
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  }
}

export function calculateTimeRemainingPercent(createdAtString, deadlineString) {
  if (!deadlineString) return 100;
  const created = createdAtString ? new Date(createdAtString).getTime() : new Date().getTime() - 86400000;
  const deadline = new Date(deadlineString).getTime();
  const now = new Date().getTime();

  if (now >= deadline) return 0;
  const total = deadline - created;
  if (total <= 0) return 0;
  const remaining = deadline - now;
  const percent = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
  return percent;
}

export function isTaskOverdue(deadlineString, completed) {
  if (!deadlineString || completed) return false;
  const deadline = new Date(deadlineString).getTime();
  const now = new Date().getTime();
  return now > deadline;
}

export function suggestRepeatInterval(deadlineString) {
  if (!deadlineString) return 1800000; // default 30 mins
  const deadline = new Date(deadlineString).getTime();
  const now = new Date().getTime();
  const diffMins = Math.max(1, Math.floor((deadline - now) / 60000));

  if (diffMins <= 30) return 600000; // 10 mins
  if (diffMins <= 360) return 3600000; // 1 hour
  if (diffMins <= 4320) return 43200000; // 12 hours
  return 86400000; // 1 day
}

export const REPEAT_INTERVAL_OPTIONS = [
  { label: 'No repeating notification', value: 0 },
  { label: 'Every 15 minutes', value: 15 * 60 * 1000 },
  { label: 'Every 30 minutes', value: 30 * 60 * 1000 },
  { label: 'Every 1 hour', value: 60 * 60 * 1000 },
  { label: 'Every 2 hours', value: 2 * 60 * 60 * 1000 },
  { label: 'Every 3 hours', value: 3 * 60 * 60 * 1000 },
  { label: 'Every 6 hours', value: 6 * 60 * 60 * 1000 },
  { label: 'Every 12 hours', value: 12 * 60 * 60 * 1000 },
  { label: 'Every day', value: 24 * 60 * 60 * 1000 },
  { label: 'Custom interval...', value: -1 },
];

export const START_REMINDER_OPTIONS = [
  { label: '15 minutes before', value: 15 * 60 * 1000 },
  { label: '30 minutes before', value: 30 * 60 * 1000 },
  { label: '1 hour before', value: 60 * 60 * 1000 },
  { label: '2 hours before', value: 2 * 60 * 60 * 1000 },
  { label: '1 day before', value: 24 * 60 * 60 * 1000 },
  { label: 'Custom start time...', value: -1 },
];
