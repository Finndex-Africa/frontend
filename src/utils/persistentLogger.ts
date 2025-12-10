// Simple persistent logger that writes messages into localStorage so they survive reloads.
// Usage:
// import { logDebug, getLogs, clearLogs } from '@/utils/persistentLogger';
// logDebug('message', { some: 'meta' });

const STORAGE_KEY = 'debugLogs_v1';

export type DebugEntry = {
  ts: string; // ISO timestamp
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  meta?: any;
};

function safeParse(raw: string | null) {
  if (!raw) return [] as DebugEntry[];
  try {
    return JSON.parse(raw) as DebugEntry[];
  } catch (err) {
    // reset invalid storage
    localStorage.removeItem(STORAGE_KEY);
    return [] as DebugEntry[];
  }
}

export function logDebug(message: string, meta?: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = safeParse(raw);
    arr.push({ ts: new Date().toISOString(), level: 'debug', message, meta });
    // keep last 200 entries to avoid unbounded growth
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    // best-effort
    // eslint-disable-next-line no-console
    console.error('Failed to persist debug log', err);
  }
}

export function logInfo(message: string, meta?: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = safeParse(raw);
    arr.push({ ts: new Date().toISOString(), level: 'info', message, meta });
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist info log', err);
  }
}

export function logError(message: string, meta?: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = safeParse(raw);
    arr.push({ ts: new Date().toISOString(), level: 'error', message, meta });
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist error log', err);
  }
}

export function getLogs(): DebugEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeParse(raw);
  } catch (err) {
    return [];
  }
}

export function clearLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

export default {
  logDebug,
  logInfo,
  logError,
  getLogs,
  clearLogs,
};
