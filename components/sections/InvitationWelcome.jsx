"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import Image from "next/image"

export default function WelcomeMessage({ onContinue }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    setIsVisible(false)
    setTimeout(onContinue, 500)
  }

  return (
    <div 
    style={{
      background: 'url(/images/zoeMerari1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat', 
    }}
    className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      

      {/* Main content card */}
      <div
        className={`relative bg-slate-400 bg-opacity-50 rounded-2xl p-6 z-10 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? "" : ""
        }`}
      >
        <div className=" p-12 text-center text-black">
          {/* Heart icon */}
          <div className="mb-8">
            <Heart className="w-16 h-16 mx-auto text-white" />
          </div>

          {/* Decorative line */}
          <div className="mb-8">
            <svg className="w-32 h-4 mx-auto text-white" viewBox="0 0 128 16" fill="none">
              <path
                d="M2 8C20 2 40 14 64 8C88 2 108 14 126 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Main message */}
          <div className="space-y-6 mb-8">
            

            <p 
            style={{ 
              textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
            }}
            className="text-xl font-bold leading-relaxed text-red-600 italic">
              ¡Te alabo porque soy una creación admirable! ¡Tus obras son maravillosas, y esto lo sé muy bien!. Salmo 139.14
              Para esta hora he llegado y para este tiempo nací en tus propósitos eternos yo me he visto Padre.
            </p>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className=" bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-600 transition-colors duration-300 shadow-lg"
          >
            Continuar
          </button>
        </div>
      </div>

      {/* Bottom decorative image */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 opacity-20">
        <Image
          src="/placeholder.svg?height=128&width=400"
          alt="Manos románticas"
          width={400}
          height={128}
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  )
}
