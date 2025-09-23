// 🏠 HeroSection - Sección principal/portada

import React, {useEffect, useState} from 'react'
//import Image from 'next/image'
import { Heart } from 'lucide-react'
import { weddingData } from '../../data/weddingData'
//import { getOverlayStyle } from '@/utils/overlay'
//import { useScrollAnimation } from '@/hooks/useScrollAnimation'
//import { getAnimationConfig } from '@/data/animationConfig'

export default function HeroSection() {
  const { couple, wedding } = weddingData
  //const { heroSection } = styling
  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
  const [isVisible, setIsVisible] = useState(false);
  

  const basicClass="font-script text-4xl text-red-500 mb-4 italic";
  const completeClass="font-script text-4xl text-red-500 mb-4 scale-up-center italic";

  useEffect(() => {
    const handleScroll = () => {
      //console.log('Scroll position:', window.scrollY);
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if(scrollPosition >= 0&& scrollPosition < 300) {
      setIsVisible(true);
    }
  },[scrollPosition])

  

  // Solo usar animación de background para el Hero, no scroll animations
  //const animationConfig = getAnimationConfig('reception')
  //const { ref: sectionRef, style: animationStyle } = useScrollAnimation(
    //animationConfig.options,
    //'background', // Solo animar el background
    //0, // Sin delay
    //false // No carga inmediata para el background
  //)

  return (
    
    
    <section 
      //ref={sectionRef}
      style={{
        backgroundImage: `url('/images/zoeMerari3.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#89ac76',
      
        position: 'relative',
      
      }}
      //id="home" 
      className="min-h-screen flex flex-col justify-center items-center relative pt-20"
    >
      
      
      
      {/* Contenido principal - Usar solo animación CSS, no scroll-based */}
      <div 
       style={{
        //backgroundColor:'#C8BFE780'
       }}
        className="bg-slate-400 bg-opacity-50 p-6 rounded-2xl relative z-10 text-center space-y-6 px-4"
      >
        <h1 
        style={{
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
        }}
        className={isVisible ? completeClass : basicClass}>
          {wedding.title.split(' ').map((word, index) => (
            <span key={index}>
              {index === 1 ? <span className="italic">{word}</span> : word}
              {index < wedding.title.split(' ').length - 1 && ' '}
            </span>
          ))}
        </h1>

      
        <div className="space-y-2">
          <div 
          style={{
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
          }}
          className="text-6xl text-amber-500 font-main-text">
            Zoe Merari
          </div>
          
        </div>

        <div 
        style={{display:'none'}}
        className="flex justify-center items-center gap-4 mt-8">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <Heart className="w-8 h-8 text-secondary" />
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>

        <p 
        style={{display:'none'}}
        className="text-lg text-muted-foreground italic max-w-md mx-auto">
          &ldquo;{couple.quote}&rdquo;
        </p>
      </div>
    </section>
    
  )
}
