export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  const wrapperClass = fullScreen
    ? 'flex min-h-[60vh] items-center justify-center'
    : 'flex items-center justify-center py-10';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
