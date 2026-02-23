export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-md border border-white/10 rounded-none border-x-0 border-b-0 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
        <p className="mb-1">
          🐉 <span className="text-mhw-gold font-semibold">MHW Hunter's Compendium</span>
        </p>
        <p>Data sourced from <a href="https://mhw-db.com" target="_blank" rel="noreferrer"
            className="text-mhw-accent hover:underline">mhw-db.com</a>
          {' '}· MERN Stack Final Project
        </p>
      </div>
    </footer>
  )
}
