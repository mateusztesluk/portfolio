import { getConfigUrlSrvFileApi } from 'config';

/**
 * URL-e plików: `config.tsx` (`getConfigUrlSrvFileApi`) + `public/config.js` (`appConfig.fileApi.baseUrl`).
 */
class FileService {

  /** Prefix .../files (bez końcowego /). */
  getFilesBaseUrl(): string {
    return getConfigUrlSrvFileApi('files');
  }

  /** Z UUID lub pełnego URL (stare wpisy) robi URL do atrybutu src obrazka. */
  resolveBlogImageUrl(stored: string): string {
    const s = (stored || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    const base = this.getFilesBaseUrl();
    if (!base) return s;
    return `${base}/${s}`;
  }

  /**
   * Do wysyłki do API bloga: sam UUID (z wartości lub z URL .../files/{uuid}).
   */
  toPhotoIdForApi(displayOrId: string): string {
    const s = (displayOrId || '').trim();
    if (!s) return '';
    const fromUrl = s.match(/\/files\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
    if (fromUrl) return fromUrl[1].toLowerCase();
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s))
      return s.toLowerCase();
    return s;
  }
}

export default FileService;
