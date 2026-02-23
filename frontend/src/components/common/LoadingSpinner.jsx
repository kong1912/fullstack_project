export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-4 border-white/10 border-t-mhw-accent`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
