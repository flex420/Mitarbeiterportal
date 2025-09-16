const DEFAULT_UPLOAD_MB = 10;
const DEFAULT_DOWNLOAD_TTL = 15;

export function getUploadLimitMb() {
  const value = Number(process.env.UPLOAD_MAX_MB ?? DEFAULT_UPLOAD_MB);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_UPLOAD_MB;
}

export function getDownloadTtlMinutes() {
  const value = Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES ?? DEFAULT_DOWNLOAD_TTL);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DOWNLOAD_TTL;
}

export function allowVacationOverlap() {
  return String(process.env.VACATION_ALLOW_OVERLAP ?? "false").toLowerCase() === "true";
}

export function storageRoot() {
  return process.env.STORAGE_ROOT ?? "./storage";
}
