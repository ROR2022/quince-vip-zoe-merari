// 👨‍👩‍👧‍👦 ParentsSection - Sección de información de padres

import React, {useState,useEffect} from "react";
import Image from "next/image";
import { weddingData } from "../../data/weddingData";

export default function ParentsSection() {
  const { parents } = weddingData;
  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
    const [isVisible, setIsVisible] = useState(false);
    
  
    const basicClass="font-main-text text-5xl text-indigo-800 mb-4";
    const completeClass="font-main-text text-5xl text-indigo-800 mb-4 scale-up-center";
  
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
      if(scrollPosition >= 600 && scrollPosition < 1200) {
        setIsVisible(true);
      }
    },[scrollPosition])
  

  return (
    <section 
    style={{
      backgroundImage: `url('/images/fondoAzul1.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
    }}
    id="parents" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            
            <div
              style={{
                backgroundColor: "#C8BFE780",
              }}
              className="relative p-6 rounded-2xl z-10 text-center space-y-8 py-12"
            >
              <p className="text-lg text-white italic max-w-2xl mx-auto leading-relaxed">
                Hoy, mi corazón rebosa de gratitud. Doy gracias a Dios por cada paso de mi vida y a mis padres  
                por cuidarme y guiarme en este camino.
                Hace quince años mis padres agradecieron a Dios por mi vida. 
                Hoy, yo agradezco a Dios por ellos, por su infinito amor y paciencia.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className={isVisible ? completeClass : basicClass}>
                    Mis papás
                  </h3>
                  <div className="space-y-2 text-white">
                    <p className="text-xl font-medium">
                      Pedro Ortiz Casas
                    </p>
                    <p className="text-xl font-medium">
                      Berenice Calamaco Martínez
                    </p>
                  </div>
                </div>

                 <div>
                  <h3 className={isVisible ? completeClass : basicClass}>
                    Mi hermana
                  </h3>
                  <div className="space-y-2 text-white">
                    <p className="text-xl font-medium">Alexa Renata</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
