import type { BackupSnapshot } from './driveSync';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

const BACKUP_FILENAME = 'hishab_ai_cloud_backup.json';

/**
 * Check if the backup file exists in the user's Google Drive
 */
export async function findDriveBackupFile(accessToken: string): Promise<DriveFileInfo | null> {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&spaces=drive`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Google Drive access token expired. Please sign in again.');
    }
    throw new Error(`Google Drive search failed: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0] as DriveFileInfo;
  }
  return null;
}

/**
 * Upload database snapshot directly to user's real Google Drive
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  snapshot: BackupSnapshot
): Promise<{ success: boolean; fileId: string; modifiedTime: string }> {
  // First check if file already exists
  const existingFile = await findDriveBackupFile(accessToken);

  const fileContent = JSON.stringify(snapshot, null, 2);

  if (existingFile) {
    // Update existing file via PATCH
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileContent
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update Google Drive backup: ${updateRes.statusText}`);
    }

    const result = await updateRes.json();
    return {
      success: true,
      fileId: result.id || existingFile.id,
      modifiedTime: new Date().toISOString()
    };
  } else {
    // Create new file via multipart upload
    const boundary = '-------HishabAIDriveSyncBoundary' + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      description: 'Hishab AI Cloud Backup - Personal Spending & Dhar Khata'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create Google Drive backup: ${createRes.statusText}`);
    }

    const result = await createRes.json();
    return {
      success: true,
      fileId: result.id,
      modifiedTime: new Date().toISOString()
    };
  }
}

/**
 * Download database snapshot from user's Google Drive
 */
export async function downloadFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<BackupSnapshot> {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup from Google Drive: ${res.statusText}`);
  }

  const snapshot = (await res.json()) as BackupSnapshot;
  return snapshot;
}
