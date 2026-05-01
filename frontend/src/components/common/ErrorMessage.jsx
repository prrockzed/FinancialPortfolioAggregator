export default function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
      <span className="text-lg">⚠</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}
