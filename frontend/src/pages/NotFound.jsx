import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-8xl mb-2">💀</div>
        <h1 className="text-4xl font-extrabold text-mhw-accent">404</h1>
        <h2 className="text-xl font-bold text-white">Hunter KO'd</h2>
        <p className="text-gray-400">
          The page you're looking for has fled or never existed.
        </p>
        <Link to="/" className="px-8 py-3 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 inline-block">
          Return to Base Camp
        </Link>
      </div>
    </div>
  )
}
