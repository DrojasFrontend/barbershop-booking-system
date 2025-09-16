import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            ✂️ BarberShop
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de turnos en tiempo real
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link 
              href="/cliente" 
              className="group bg-blue-500 hover:bg-blue-600 text-white p-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-bold mb-2">Soy Cliente</h2>
              <p className="text-blue-100 mb-3">
                • Solicita tu turno fácilmente<br/>
                • Ve el estado de tus citas<br/>
                • Sin necesidad de registro
              </p>
            </Link>
            
            <Link 
              href="/login" 
              className="group bg-green-500 hover:bg-green-600 text-white p-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-4">✂️</div>
              <h2 className="text-2xl font-bold mb-2">Soy Barbero</h2>
              <p className="text-green-100">
                Gestiona turnos y agenda en tiempo real
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}