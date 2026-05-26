export const metadata = {
    robots: 'noindex, nofollow',
};

export default function OncePage() {
    return (
        <main
            style={{
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: '0.5rem',
                color: '#888',
                userSelect: 'none',
            }}
        >
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>you found it.</p>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#555' }}>
                this page will never load again.
            </p>
        </main>
    );
}
