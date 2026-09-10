export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '18px 20px', marginTop: 'auto', borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--muted)' }}>
      Built by{' '}
      <a
        href="https://github.com/amar2512003"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--primary-dark)', fontWeight: 700, textDecoration: 'none' }}
      >
        Amar
      </a>
    </footer>
  );
}