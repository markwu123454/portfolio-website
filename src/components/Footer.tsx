export function Footer() {
    return (
        <footer className="border-t">
            <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">
                © {new Date().getFullYear()} Mark Wu • <a href="mailto:me@markwu.org" className="underline">me@markwu.org</a>
            </div>
        </footer>
    );
}
