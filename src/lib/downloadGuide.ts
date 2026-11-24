import { toast } from 'sonner';

const PDF_FILENAME = 'LBFL-Basketball-Fantasy-Guide.pdf';

export async function downloadBasketballGuidePdf(): Promise<boolean> {
  const candidates = ['/download/basketball-guide.pdf', `/${PDF_FILENAME}`];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) continue;

      const buffer = await response.arrayBuffer();
      const header = new TextDecoder('ascii').decode(buffer.slice(0, 5));
      if (!header.startsWith('%PDF-')) continue;

      const blob = new Blob([buffer], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = PDF_FILENAME;
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      toast.success('Downloading LBFL Basketball Fantasy Guide PDF');
      return true;
    } catch {
      // Try next candidate
    }
  }

  toast.error('Direct download blocked by browser. Opening Guide page with Print / Save PDF.');
  return false;
}
