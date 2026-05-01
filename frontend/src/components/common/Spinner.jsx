export default function Spinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  )
}
