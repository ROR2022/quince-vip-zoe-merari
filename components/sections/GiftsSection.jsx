// 🎁 GiftsSection - Sección de información de regalos

import React, { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { weddingData } from "../../data/weddingData";
//import { getOverlayStyle } from "@/utils/overlay";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getAnimationConfig } from "@/data/animationConfig";
//import Image from "next/image";

export default function GiftsSection() {
  const { gifts } = weddingData;
  //const { giftsSection } = styling;

  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
  const [isVisible, setIsVisible] = useState(false);

  const basicClass = "font-main-text text-5xl text-white";
  const completeClass = "font-main-text text-5xl text-white scale-up-center";

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
    if (scrollPosition >= 4800 && scrollPosition < 5400) {
      setIsVisible(true);
    }
  }, [scrollPosition]);

  // Configurar animación de scroll
  const animationConfig = getAnimationConfig("gifts");
  const { ref: sectionRef, style: animationStyle } = useScrollAnimation(
    animationConfig.options,
    animationConfig.type,
    animationConfig.delay
  );

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundImage: `url('/images/fondoAzul1.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: "relative",
        ...animationStyle,
      }}
      id="gifts"
      className="py-20"
    >
      {/* Overlay configurable */}
      {/* <div
        style={getOverlayStyle(giftsSection)}
        className="absolute inset-0 z-0"
      ></div> */}

      <div
        style={{
          animation: "bounce1 2s ease 0s 1 normal forwards",
          backgroundColor: "#C8BFE795",
        }}
        className="container bg-slate-300 bg-opacity-60 mx-auto px-4  p-6 rounded-2xl"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 
          style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
          className={isVisible ? completeClass : basicClass}>Regalo</h2>

          <div className="bg-muted/50 rounded-2xl p-8 max-w-md mx-auto">
            <Gift className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 
            style={{display:'none'}}
            className="font-script text-3xl text-foreground mb-4">
              {gifts.type}
            </h3>
            <p className="text-muted-foreground">{gifts.message}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
            <div className="bg-white/70 p-6 rounded-2xl w-64">
              <h4 className="text-xl font-medium mb-2">Lluvia de Sobres</h4>
              <p className="text-muted-foreground">
                
              </p>
              <p className="text-muted-foreground">
                Puedes regalarme efectivo en un sobre.
              </p>
            </div>
            <div 
            style={{display:'none'}}
            className="bg-white/70 p-6 rounded-2xl w-64">
              <h4 className="text-xl font-medium mb-2">Mesa de Regalos</h4>
              <p className="text-muted-foreground">
                Amazon
              </p>
              <p className="text-muted-foreground">
                ID: 1234567890
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
