export interface DriveUploadResponse {
  ok: boolean
  fileId?: string
  folderPath?: string
  viewUrl?: string
  error?: string
}

export interface DriveFileContentResponse {
  ok: boolean
  fileId?: string
  name?: string
  mimeType?: string
  content?: string
  error?: string
}

const DRIVE_URL_KEY = 'vll_drive_webapp_url_v1'
const fileContentCache = new Map<string, string>()

export function getDriveWebAppUrl(): string {
  try {
    const saved = localStorage.getItem(DRIVE_URL_KEY)?.trim()
    if (saved) return saved
  } catch {
    // ignore storage errors
  }
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DRIVE_WEBAPP_URL
  return (envUrl || '').trim()
}

export function saveDriveWebAppUrl(url: string) {
  try {
    localStorage.setItem(DRIVE_URL_KEY, url.trim())
  } catch {
    // ignore storage errors
  }
}

export function buildExperimentFolderParts(params: {
  departmentName?: string
  labName?: string
  experimentCode?: string
  slug?: string
}): string[] {
  const dept = (params.departmentName || 'General Department').trim()
  const lab = (params.labName || 'General Laboratory').trim()
  const expFolder = (params.experimentCode || params.slug || 'Experiment').trim()
  return [dept, lab, expFolder]
}

export async function uploadFileToDrive(params: {
  folderParts: string[]
  fileName: string
  mimeType: string
  content: string
  webAppUrl?: string
}): Promise<DriveUploadResponse> {
  const url = (params.webAppUrl || getDriveWebAppUrl()).trim()
  if (!url) {
    return { ok: false, error: 'Google Drive Web App URL is not configured.' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        folderParts: params.folderParts,
        fileName: params.fileName,
        mimeType: params.mimeType,
        content: params.content,
      }),
    })
    const data = (await res.json()) as DriveUploadResponse
    if (data.ok && data.fileId && params.content) {
      fileContentCache.set(data.fileId, params.content)
    }
    return data
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to upload to Google Drive.',
    }
  }
}

export async function fetchFileFromDrive(
  fileId: string,
  webAppUrl?: string
): Promise<DriveFileContentResponse> {
  const cleanId = (fileId || '').trim()
  if (!cleanId) {
    return { ok: false, error: 'Missing Google Drive fileId.' }
  }

  const cached = fileContentCache.get(cleanId)
  if (cached !== undefined) {
    return { ok: true, fileId: cleanId, content: cached }
  }

  const url = (webAppUrl || getDriveWebAppUrl()).trim()
  if (!url) {
    return { ok: false, error: 'Google Drive Web App URL is not configured.' }
  }

  try {
    const endpoint = `${url}${url.includes('?') ? '&' : '?'}fileId=${encodeURIComponent(cleanId)}`
    const res = await fetch(endpoint, { method: 'GET' })
    const data = (await res.json()) as DriveFileContentResponse
    if (data.ok && typeof data.content === 'string') {
      fileContentCache.set(cleanId, data.content)
    }
    return data
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to load file from Google Drive.',
    }
  }
}


export async function fetchDriveFileContent(
  fileId: string,
  customWebAppUrl?: string
): Promise<DriveFileContentResponse> {
  const cleanId = (fileId || "").trim()
  if (!cleanId) {
    return { ok: false, error: "Missing Google Drive fileId" }
  }
  const baseUrl = (customWebAppUrl || getDriveWebAppUrl() || "").trim()
  if (!baseUrl) {
    return { ok: false, error: "Google Drive Web App URL is not configured" }
  }
  if (fileContentCache.has(cleanId)) {
    return { ok: true, fileId: cleanId, content: fileContentCache.get(cleanId) }
  }
  try {
    const sep = baseUrl.includes("?") ? "&" : "?"
    const res = await fetch(`${baseUrl}${sep}fileId=${encodeURIComponent(cleanId)}`, {
      method: "GET",
      redirect: "follow",
    })
    const data = await res.json()
    if (data && data.ok && typeof data.content === "string") {
      fileContentCache.set(cleanId, data.content)
    }
    return data
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to fetch file from Google Drive" }
  }
}
