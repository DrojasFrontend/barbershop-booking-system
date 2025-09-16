import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-amber-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-amber-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-amber-400 rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">✂️</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4 tracking-tight">
            BarberShop
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            Sistema de turnos inteligente
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full"></div>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {/* Cliente Card */}
          <Link 
            href="/cliente" 
            className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:border-amber-400/50 shadow-2xl hover:shadow-amber-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:from-amber-400 group-hover:to-yellow-500 transition-all duration-500">
                <span className="text-2xl">👤</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">
                Soy Cliente
              </h2>
              
              <div className="space-y-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Reserva tu turno al instante
                </p>
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Seguimiento en tiempo real
                </p>
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Sin registro necesario
                </p>
              </div>
            </div>
          </Link>
          
          {/* Barbero Card */}
          <Link 
            href="/login" 
            className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:border-amber-400/50 shadow-2xl hover:shadow-amber-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-amber-400/50 transition-all duration-500">
                <span className="text-2xl">✂️</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">
                Soy Barbero
              </h2>
              
              <div className="space-y-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Gestiona tu agenda
                </p>
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Notificaciones en vivo
                </p>
                <p className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Panel profesional
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Powered by <span className="text-amber-400 font-semibold">BarberShop Pro</span>
          </p>
        </div>
      </div>
    </div>
  );
}