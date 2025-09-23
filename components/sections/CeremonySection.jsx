// ⛪ CeremonySection - Sección de información de la ceremonia

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { weddingData } from "../../data/weddingData";
//import { useMapNavigation } from "../../hooks/useMapNavigation";
//import { getOverlayStyle } from "@/utils/overlay";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getAnimationConfig } from "@/data/animationConfig";

export default function CeremonySection() {
  const { ceremony, couple } = weddingData;
  //const { goToCeremony } = useMapNavigation();
  //const { ceremonySection } = styling;

  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
  const [isVisible, setIsVisible] = useState(false);

  const basicClass = "text-2xl font-bold text-foreground";
  const completeClass = "text-2xl font-bold text-foreground scale-up-center";

  useEffect(() => {
    const handleScroll = () => {
      //console.log('Scroll position:', window.scrollY);
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (scrollPosition >= 2300 && scrollPosition < 2900) {
      setIsVisible(true);
    }
  }, [scrollPosition]);

  // Configurar animación de scroll
  const animationConfig = getAnimationConfig("ceremony");
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        zIndex: 5000,
        ...animationStyle,
      }}
      id="ceremony"
      className="py-20"
    >
      {/* Overlay configurable */}
      {/* <div
        style={getOverlayStyle(ceremonySection)}
        className="absolute inset-0 z-0"
      ></div> */}

      <div
        style={{
          // Mantener animación CSS pero optimizada
          animation: "bounce1 1.5s ease 0s 1 normal forwards", // Más rápida
          willChange: "transform, opacity", // Optimización para móviles
          position: "relative",
          zIndex: 4000,
          backgroundColor: "#C8BFE780",
        }}
        className="container bg-slate-300 bg-opacity-60 mx-auto px-4  p-6 rounded-2xl"
      >
        <div
          style={{
            position: "relative",
            zIndex: 4000,
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative w-full flex justify-center items-center h-96 rounded-2xl shadow-lg overflow-hidden">
              <Image
                src="/images/zoeMerari5.jpg"
                alt="Pareja al atardecer"
                fill
                className="object-cover "
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 4000,
              }}
              className="space-y-6"
            >
              <div className="text-center">
                <div
                  style={{
                    position: "relative",
                    zIndex: 4000,
                  }}
                  className="space-y-4"
                >
                  <div className="text-5xl text-indigo-800 font-main-text mb-4">
                    Ceremonia
                  </div>
                  <h4 className={isVisible ? completeClass : basicClass}>
                    Capellania de Nuestra Señora de Guadalupe
                  </h4>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-medium">
                      7:00 PM
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Rosendo Guerrero (calle 19) # 793 entre avenida Victoria y Guerrero
                  </p>

                  <Button
                    style={{
                      position: "relative",
                      zIndex: 5000, // Asegurar que el botón esté por encima de otros elementos
                    }}
                    onClick={() => window.open("https://maps.app.goo.gl/a41czJ9TJrejR85J9", "_blank")}
                    className="bg-slate-800 hover:text-black hover:bg-slate-400 text-white rounded-full px-8 py-3"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ir al mapa
                  </Button>
                </div>
                <div
                  style={{
                    position: "relative",
                    zIndex: 4000,
                  }}
                  className="space-y-4"
                >
                  <div className="text-5xl text-indigo-800 font-main-text mb-4">
                    Recepción
                  </div>
                  <h4 className={isVisible ? completeClass : basicClass}>
                    Paseo Real Casino 480
                  </h4>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-medium">
                      8:00 PM
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Col Ex Hacienda los Ángeles
                  </p>

                  <Button
                    style={{
                      position: "relative",
                      zIndex: 5000, // Asegurar que el botón esté por encima de otros elementos
                    }}
                    onClick={() => window.open("https://maps.app.goo.gl/vL7za74YeQS5gAYb8?g_st=aw", "_blank")}
                    className="bg-slate-800 hover:text-black hover:bg-slate-400 text-white rounded-full px-8 py-3"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ir al mapa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
