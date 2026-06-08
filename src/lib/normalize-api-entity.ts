/** Unwrap Mongoose documents accidentally serialized in API list responses. */
export function normalizeApiEntity<T>(raw: unknown): T {
  if (!raw || typeof raw !== 'object') return raw as T;

  const record = raw as Record<string, unknown>;
  if (record._doc && typeof record._doc === 'object') {
    const doc = record._doc as Record<string, unknown>;
    const extras = Object.fromEntries(
      Object.entries(record).filter(
        ([key]) => !key.startsWith('$') && key !== '_doc' && key !== '_isNew',
      ),
    );
    return { ...doc, ...extras } as T;
  }

  return raw as T;
}

export function normalizeApiEntityList<T>(items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeApiEntity<T>(item));
}
