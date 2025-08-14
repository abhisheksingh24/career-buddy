export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">AI Resume & Portfolio Optimizer</h1>
      <p className="text-muted-foreground">Start with the dashboard, upload, or analyze pages.</p>
      <ul className="list-disc pl-6">
        <li><a className="text-blue-600 underline" href="/dashboard">Dashboard</a></li>
        <li><a className="text-blue-600 underline" href="/upload">Upload</a></li>
        <li><a className="text-blue-600 underline" href="/analyze">Analyze</a></li>
      </ul>
    </div>
  );
}
