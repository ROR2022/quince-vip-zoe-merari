// ⏰ TimelineSection - Sección de cronograma del evento

import React, {useState,useEffect} from 'react'
import Image from 'next/image'
import { weddingData } from '../../data/weddingData'
//import { getOverlayStyle } from '@/utils/overlay'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { getAnimationConfig } from '@/data/animationConfig'

export default function TimelineSection() {
  const { timeline, messages } = weddingData
  //const { timelineSection } = styling

  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
          const [isVisible, setIsVisible] = useState(false);
          
        
          const basicClass="w-full h-full relative";
          const completeClass="w-full h-full relative scale-up-center";

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
            if(scrollPosition >= 2900 && scrollPosition < 3500) {
              setIsVisible(true);
            }
          },[scrollPosition])
    

  // Configurar animación de scroll
  const animationConfig = getAnimationConfig('timeline')
  const { ref: sectionRef, style: animationStyle } = useScrollAnimation(
    animationConfig.options,
    animationConfig.type,
    animationConfig.delay
  )

  return (
    <section
      ref={sectionRef}
      style={{
          backgroundImage: `url('/images/fondoAzul1.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',  
        position: 'relative',
        ...animationStyle
      }}
     id="timeline" className="py-20">
      {/* Overlay configurable */}
          {/*   <div
              style={getOverlayStyle(timelineSection)}
              className="absolute inset-0 z-0"
            ></div> */}

      <div 
      style={{
        animation: 'bounce1 2s ease 0s 1 normal forwards'
      }}
      className="container bg-slate-300 bg-opacity-60 mx-auto px-4 bg-transparent p-6 rounded-2xl">


        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center bg-transparent">
            <div className="relative w-full h-96 rounded-2xl  overflow-hidden">
              {/* Contenedor con forma de corazón - Versión más grande */}
              <div 
                className="w-full h-full relative"
                
              >
                <div 
                  className={isVisible ? completeClass : basicClass}
                >
                  <Image
                    src="/images/quinceAzul4.jpg"
                    alt="Celebración"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-slate-400 bg-opacity-80 p-6 rounded-2xl">
              {timeline.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-5 bg-card rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  style={{
                    animation: `slideInRight 0.6s ease-out ${index * 0.2}s both`
                  }}
                >
                  <div 
                    className={`w-16 h-16 ${
                      item.color === 'primary' ? 'bg-primary' : 'bg-secondary'
                    } rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 relative overflow-hidden`}
                  >
                    {/* Efecto de brillo sutil */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full"></div>
                    <span 
                      className="text-2xl filter drop-shadow-sm relative z-10"
                      role="img" 
                      aria-label={item.name}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-card-foreground mb-1">{item.name}</div>
                    <div 
                      className={`text-2xl font-bold ${
                        item.color === 'primary' ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {item.time}
                    </div>
                  </div>
                  
                  {/* Indicador de conexión visual */}
                  <div className="hidden md:block w-2 h-2 bg-current opacity-30 rounded-full"></div>
                </div>
              ))}

              <div 
              style={{
                backgroundColor: "#C8BFE780",
              }}
              className=" text-center mt-8 p-6 bg-slate-300 bg-opacity-60 rounded-lg">
                <p className="text-lg italic text-muted-foreground">
                  &ldquo;{messages.timelineQuote}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
