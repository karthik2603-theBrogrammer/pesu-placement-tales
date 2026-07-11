export default function BrowseShell({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <div className="relative z-10 flex-grow overflow-auto">{children}</div>
    </div>
  );
}
