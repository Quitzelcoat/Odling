export const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:3000';

export function makeImageUrl(pic) {
  if (!pic) return '';
  if (pic.startsWith('http://') || pic.startsWith('https://')) return pic;
  if (pic.startsWith('/uploads')) {
    return `${API_BASE}${pic}`;
  }
  if (pic.includes('uploads')) {
    const normalized = pic.startsWith('/') ? pic : `/${pic}`;
    return `${API_BASE}${normalized}`;
  }
  return pic;
}
