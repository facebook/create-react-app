export default function ApiDocs() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-800">API Documentation</h1>
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline ml-auto"
        >
          Open in new tab →
        </a>
      </div>
      <iframe
        src="/api/docs"
        className="flex-1 w-full border-0"
        title="API Documentation"
      />
    </div>
  );
}
