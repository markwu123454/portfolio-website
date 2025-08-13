export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-5xl font-bold">404</h1>
            <p className="mt-4 text-lg text-gray-600">
                Sorry, the page you’re looking for doesn’t exist.
            </p>
            <a
                href="/"
                className="mt-6 rounded-lg border border-white/20 px-4 py-2 hover:bg-white hover:text-black"
            >
                Go Home
            </a>
        </div>
    );
}
