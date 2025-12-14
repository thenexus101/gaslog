import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function getMonthStart(date: Date = new Date()): Date {
  return startOfMonth(date);
}

export function getMonthEnd(date: Date = new Date()): Date {
  return endOfMonth(date);
}

export function getYearStart(date: Date = new Date()): Date {
  return startOfYear(date);
}

export function getYearEnd(date: Date = new Date()): Date {
  return endOfYear(date);
}

export function isInCurrentMonth(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  return isWithinInterval(dateObj, {
    start: getMonthStart(now),
    end: getMonthEnd(now),
  });
}

export function isInCurrentYear(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  return isWithinInterval(dateObj, {
    start: getYearStart(now),
    end: getYearEnd(now),
  });
}

