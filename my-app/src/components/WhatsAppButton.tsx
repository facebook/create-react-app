import seo from '../data/seo.json';

interface WhatsAppButtonProps {
  /** Prefilled into the chat, so the first message already has context. */
  message?: string;
  variant?: 'solid' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

/**
 * wa.me rather than api.whatsapp.com: it opens the app on a phone and
 * WhatsApp Web on a desktop, without a redirect page in between.
 *
 * The number carries the country code and no punctuation, which is what the
 * link format requires -- spaces or a leading + here silently fail.
 */
export function WhatsAppButton({
  message = 'Hello, I would like to enquire about a vehicle.',
  variant = 'solid',
  className = '',
  children,
}: WhatsAppButtonProps) {
  const number = seo.site.phone.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2';
  const styles =
    variant === 'solid'
      ? 'bg-[#25D366] text-[#04310f] hover:bg-[#25D366]/90 focus-visible:outline-navy'
      : 'border border-line text-ink-dim hover:border-navy/40 hover:text-navy focus-visible:outline-gold';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.21-8.24 8.21z" />
      </svg>
      {children ?? 'WhatsApp us'}
    </a>
  );
}
