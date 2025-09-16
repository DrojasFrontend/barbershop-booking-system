import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="text-center max-w-md mx-auto">
          {/* Logo/Title */}
          <h1 className="font-display text-6xl md:text-8xl mb-8 tracking-tight">
            BARBER
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-16">
            Professional Booking System
          </p>
          
          {/* Navigation */}
          <div className="space-y-4">
            <Link 
              href="/cliente"
              className="block w-full bg-white text-black py-4 px-8 text-center font-medium uppercase tracking-wide hover:bg-gray-200 transition-colors"
            >
              Book Appointment
            </Link>
            
            <Link 
              href="/login"
              className="block w-full border border-white text-white py-4 px-8 text-center font-medium uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              Barber Access
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          Minimalist Design
        </p>
      </div>
    </div>
  );
}