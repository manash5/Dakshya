export default function ScrapeLoading() {
    return (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-[#5a7a1e]" />
            <div>
                <p className="font-medium text-gray-900">Scraping every active job role across all sources…</p>
                <p className="mt-0.5 text-xs text-gray-400">
                    This can take a minute or two — please keep this page open.
                </p>
            </div>
        </div>
    );
}
