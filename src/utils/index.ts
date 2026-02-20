export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).trim();
  return truncated.replace(/[.,!?]$/, '') + '...';
}

export function getPreviewContent(content: string): string {
  const sections = content.split('##').filter(Boolean);
  const overview = sections[0]?.split('\n').slice(1).join(' ').trim() || '';
  return overview;
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}