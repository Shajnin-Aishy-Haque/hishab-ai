/**
 * Storage Persistence Service
 * Utilizes the StorageManager API to protect client IndexedDB from eviction
 * and provides disk usage metrics.
 */

export interface StorageStatus {
  persisted: boolean;
  quota?: number;
  usage?: number;
  formattedUsage?: string;
  formattedQuota?: string;
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Check and request persistent storage from the browser
 */
export async function ensureStoragePersistence(): Promise<StorageStatus> {
  let persisted = false;
  let quota: number | undefined;
  let usage: number | undefined;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persisted) {
        persisted = await navigator.storage.persisted();
      }

      // If not yet persisted, politely request persistent storage
      if (!persisted && navigator.storage.persist) {
        persisted = await navigator.storage.persist();
      }

      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota;
        usage = estimate.usage;
      }
    }
  } catch (err) {
    console.warn('Storage persistence check notice:', err);
  }

  return {
    persisted,
    quota,
    usage,
    formattedUsage: formatBytes(usage),
    formattedQuota: formatBytes(quota)
  };
}
