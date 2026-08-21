// ─────────────────────────────────────────────────────────────────────────────
// Image processing utilities — runs entirely in the browser.
// No server-side code or external API calls.
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageFileInfo {
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;          // verified from file header bytes
  extension: string;
  filename: string;
  objectUrl: string;         // revoke when done to avoid memory leaks
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  info?: ImageFileInfo;
}

export interface ProcessedVariant {
  blob: Blob;
  width: number;
  height: number;
  format: 'webp' | 'jpeg' | 'png';
  label: 'desktop' | 'mobile' | 'thumb';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

// Real MIME types from file header magic numbers
const MAGIC: Array<{ mime: string; ext: string; bytes: number[]; mask?: number[] }> = [
  { mime: 'image/jpeg', ext: 'jpg',  bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  ext: 'png',  bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  // WebP: starts with RIFF....WEBP
  { mime: 'image/webp', ext: 'webp', bytes: [0x52, 0x49, 0x46, 0x46] },
  // GIF (animated — rejected)
  { mime: 'image/gif',  ext: 'gif',  bytes: [0x47, 0x49, 0x46, 0x38] },
];

// SUSPICIOUS filename patterns
const SUSPICIOUS_FILENAME_RE = /[\x00-\x1F\\/:*?"<>|;$`!{}]/;

// ─── File validation ──────────────────────────────────────────────────────────

/** Read the first N bytes from a File as Uint8Array */
async function readFileHeader(file: File, bytes = 12): Promise<Uint8Array> {
  const slice = file.slice(0, bytes);
  const ab = await slice.arrayBuffer();
  return new Uint8Array(ab);
}

/** Verify file header and return real MIME type, or null if unrecognised/unsupported */
async function detectRealMime(file: File): Promise<string | null> {
  const header = await readFileHeader(file, 12);
  for (const sig of MAGIC) {
    const match = sig.bytes.every((b, i) => header[i] === b);
    if (match) {
      if (sig.mime === 'image/gif') return null; // reject animated GIF
      // WebP: also check bytes 8–11 for 'WEBP'
      if (sig.mime === 'image/webp') {
        if (header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
          return 'image/webp';
        }
        return null; // RIFF but not WEBP
      }
      return sig.mime;
    }
  }
  // AVIF: check for ftyp box with 'avif' brand
  if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
    const brand = String.fromCharCode(header[8], header[9], header[10], header[11]);
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
  }
  return null;
}

/** Load an Image element from a blob URL, returning width/height */
function loadImageDimensions(objectUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = objectUrl;
  });
}

/** Validate and gather info for a dropped/selected file */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  // 1. Suspicious filename
  if (SUSPICIOUS_FILENAME_RE.test(file.name)) {
    return { valid: false, error: 'Filename contains invalid characters. Rename the file and try again.' };
  }

  // 2. Extension
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is not supported. Allowed: JPG, PNG, WebP, AVIF.` };
  }

  // 3. Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File is too large (${formatBytes(file.size)}). Maximum allowed: 10 MB.` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File appears to be empty or corrupt.' };
  }

  // 4. Real MIME from header bytes
  const realMime = await detectRealMime(file);
  if (!realMime) {
    return { valid: false, error: 'File header does not match a supported image format, or the format is not allowed (e.g. animated GIF).' };
  }

  // 5. Dimensions
  const objectUrl = URL.createObjectURL(file);
  let dims: { width: number; height: number };
  try {
    dims = await loadImageDimensions(objectUrl);
  } catch {
    URL.revokeObjectURL(objectUrl);
    return { valid: false, error: 'Image could not be decoded. The file may be corrupt.' };
  }

  if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
    URL.revokeObjectURL(objectUrl);
    return { valid: false, error: `Image is too small (${dims.width}×${dims.height}px). Minimum: ${MIN_WIDTH}×${MIN_HEIGHT}px.` };
  }

  return {
    valid: true,
    info: {
      width: dims.width,
      height: dims.height,
      sizeBytes: file.size,
      mimeType: realMime,
      extension: ext,
      filename: sanitizeFilename(file.name),
      objectUrl,
    },
  };
}

// ─── Filename handling ────────────────────────────────────────────────────────

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w\-_.]/g, '-')
    .replace(/-{2,}/g, '-')
    .toLowerCase()
    .slice(0, 80);
}

/** Generate a stable, versioned filename for storage */
export function generateStableFilename(
  assetKey: string,
  version: number,
  label: 'desktop' | 'mobile' | 'thumb',
  format: 'webp' | 'jpeg' | 'png'
): string {
  const safeKey = assetKey.replace(/\./g, '-');
  return `${safeKey}/v${version}-${label}.${format === 'jpeg' ? 'jpg' : format}`;
}

// ─── Canvas-based image processing ───────────────────────────────────────────

/** Load a File into an HTMLImageElement */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/** Load an HTMLImageElement from a Blob (e.g. a file downloaded from private storage) */
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not decode image from blob')); };
    img.src = objectUrl;
  });
}

/** Load an image from a URL */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
}

/** Resize an HTMLImageElement to a target width (maintaining aspect ratio) via canvas */
function resizeOnCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  focalX = 0.5,
  focalY = 0.5,
  targetAspect?: number // optional forced aspect ratio
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;

  if (targetAspect) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    if (imgAspect > targetAspect) {
      // Image is wider than target — crop horizontally
      srcW = Math.round(img.naturalHeight * targetAspect);
      const maxOffset = img.naturalWidth - srcW;
      srcX = Math.round(focalX * maxOffset);
    } else {
      // Image is taller than target — crop vertically
      srcH = Math.round(img.naturalWidth / targetAspect);
      const maxOffset = img.naturalHeight - srcH;
      srcY = Math.round(focalY * maxOffset);
    }
  }

  const scale = targetWidth / srcW;
  canvas.width = Math.round(srcW * scale);
  canvas.height = Math.round(srcH * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Convert canvas to Blob in specified format */
function canvasToBlob(canvas: HTMLCanvasElement, format: 'webp' | 'jpeg' | 'png', quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mime = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), mime, quality);
  });
}

/** Generate all variants for a given image file */
export async function generateVariants(
  img: HTMLImageElement,
  focalX: number,
  focalY: number,
): Promise<ProcessedVariant[]> {
  const variants: ProcessedVariant[] = [];

  // Desktop — 1400px wide max, 4:3 aspect
  const desktopCanvas = resizeOnCanvas(img, Math.min(1400, img.naturalWidth), focalX, focalY, 4 / 3);
  const desktopWebP = await canvasToBlob(desktopCanvas, 'webp', 0.85);
  const desktopJpeg = await canvasToBlob(desktopCanvas, 'jpeg', 0.85);
  variants.push({ blob: desktopWebP, width: desktopCanvas.width, height: desktopCanvas.height, format: 'webp', label: 'desktop' });
  variants.push({ blob: desktopJpeg, width: desktopCanvas.width, height: desktopCanvas.height, format: 'jpeg', label: 'desktop' });

  // Mobile — 800px wide, 1:1 square crop (uses focal point for vertical centering)
  const mobileCanvas = resizeOnCanvas(img, Math.min(800, img.naturalWidth), focalX, focalY, 1);
  const mobileWebP = await canvasToBlob(mobileCanvas, 'webp', 0.82);
  const mobileJpeg = await canvasToBlob(mobileCanvas, 'jpeg', 0.82);
  variants.push({ blob: mobileWebP, width: mobileCanvas.width, height: mobileCanvas.height, format: 'webp', label: 'mobile' });
  variants.push({ blob: mobileJpeg, width: mobileCanvas.width, height: mobileCanvas.height, format: 'jpeg', label: 'mobile' });

  // Thumb — 400px wide, square
  const thumbCanvas = resizeOnCanvas(img, 400, focalX, focalY, 1);
  const thumbWebP = await canvasToBlob(thumbCanvas, 'webp', 0.80);
  variants.push({ blob: thumbWebP, width: thumbCanvas.width, height: thumbCanvas.height, format: 'webp', label: 'thumb' });

  return variants;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDimensions(w: number, h: number): string {
  return `${w} × ${h} px`;
}
