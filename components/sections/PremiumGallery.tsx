'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react'
import Image from 'next/image'
import { useIsClient } from "@/hooks/useIsClient"
import { premiumDemoData } from "./data/premium-demo-data"

export function PremiumGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const isClient = useIsClient()

  const images = premiumDemoData.gallery.images

  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
    const [isVisible, setIsVisible] = useState(false);
  
    const basicClass = "text-5xl font-bold mb-4 font-main-text";
    const completeClass = "text-5xl font-bold mb-4 scale-up-center font-main-text";
  
    useEffect(() => {
      const handleScroll = () => {
        //console.log("Scroll position:", window.scrollY);
        setScrollPosition(window.scrollY);
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);
  
    useEffect(() => {
      if (scrollPosition >= 5400 && scrollPosition < 6000) {
        setIsVisible(true);
      }
    }, [scrollPosition]);
  


  const goToPrevious = useCallback(() => {
    if (!isClient) return
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }, [currentIndex, isClient, images.length])

  const goToNext = useCallback(() => {
    if (!isClient) return
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }, [currentIndex, isClient, images.length])

  const goToSlide = (slideIndex: number) => {
    if (!isClient) return
    setCurrentIndex(slideIndex)
  }

  const openModal = () => {
    if (!isClient) return
    setIsModalOpen(true)
  }

  const closeModal = useCallback(() => {
    if (!isClient) return
    setIsModalOpen(false)
  }, [isClient])

  // Event listeners solo en cliente
  useEffect(() => {
    if (!isClient) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, isModalOpen, goToNext, goToPrevious, closeModal, isClient])

  return (
    <section 
    style={{
      /* background: 'url(/images/fondoAzul2.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat', */
      backgroundColor: '#fff',
      position: 'relative',
    }}
    className="py-16 px-4">
      <div
        ref={ref}
        className={` p-4 rounded-2xl max-w-4xl mx-auto text-center transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Header premium */}
        <div className="mb-12">
          <div className="inline-block text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg" style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}>
            📸 Galería
          </div>

          <h2 
          className={isVisible ? completeClass : basicClass} 
          style={{ color: '#ddd', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
          >
            {premiumDemoData.gallery.title}
          </h2>
          <p className="text-xl mb-2 text-indigo-800 italic">
            {premiumDemoData.gallery.subtitle}
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {premiumDemoData.gallery.description}
          </p>
        </div>

        <div className="divider flex items-center justify-center my-4">
          <div className="divider-icon">
            <Camera className="w-8 h-8" style={{ color: '#e3aaaa' }} />
          </div>
        </div>
        <div>
          <p className='text-gray-900'>Click en la imagen para ampliarla</p>
        </div>
        {/* Galería principal */}
        <div className="relative h-64 md:h-80 mt-8 group">
          <div className="w-full h-full flex justify-center">
            <div className="relative w-full max-w-2xl h-full overflow-hidden rounded-2xl shadow-xl border-4 border-white">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={openModal}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openModal()
                      e.preventDefault()
                    }
                  }}
                  role="button"
                  tabIndex={isClient ? 0 : -1}
                >
                  <Image
                    src={image.src || '/placeholder.svg'}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain cursor-pointer"
                  />
                  
                  {/* Caption overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm md:text-base font-medium">
                      {image.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons - solo mostrar en cliente */}
          {isClient && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-3 rounded-full shadow-md transition-all z-10 hover:opacity-80"
                style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-3 rounded-full shadow-md transition-all z-10 hover:opacity-80"
                style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Indicators - solo mostrar en cliente */}
          {isClient && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-6' 
                      : 'bg-white/70 hover:bg-white'
                  }`}
                  style={index === currentIndex ? { backgroundColor: '#e3aaaa' } : {}}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        
      </div>

      {/* Modal - solo renderizar en cliente */}
      {isClient && isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-5xl h-[80vh]">
            <button
              onClick={closeModal}
              className="absolute right-2 top-2 text-white p-2 rounded-full z-20 transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex].src || '/placeholder.svg'}
                alt={images[currentIndex].alt}
                fill
                className="object-contain"
              />
              
              {/* Caption en modal */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                <p className="text-lg font-medium">{images[currentIndex].caption}</p>
              </div>
            </div>

            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full shadow-md transition-all z-10 hover:opacity-80"
              style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={30} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full shadow-md transition-all z-10 hover:opacity-80"
              style={{ background: 'linear-gradient(to right, #e3aaaa, #d49999)' }}
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={30} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'w-6' : 'bg-white/50'
                  }`}
                  style={index === currentIndex ? { backgroundColor: '#e3aaaa' } : {}}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
} 