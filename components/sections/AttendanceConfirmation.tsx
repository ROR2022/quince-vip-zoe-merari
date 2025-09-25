import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Phone,
  Heart,
  Sparkles,
  User,
  MessageCircle,
  Users,
  CheckCircle,
} from "lucide-react";

const AttendanceConfirmation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    numeroInvitados: 1,
    confirmacion: "si", // 'si' o 'no'
    mensaje: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);

  // Número de WhatsApp de destino
  const whatsappNumber = "5218711249363"; // +52 1 8711249363

  // Función para detectar si los pop-ups están bloqueados
  const checkPopupBlocked = () => {
    try {
      const popup = window.open('', '', 'width=1,height=1');
      if (popup && !popup.closed) {
        popup.close();
        return false; // No bloqueado
      }
      return true; // Bloqueado
    } catch {
      return true; // Error = bloqueado
    }
  };

  // Función para detectar dispositivo y navegador
  const getDeviceAndBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    return {
      isMobile,
      isIOS,
      isAndroid,
      userAgent,
      isChromeMobile: isMobile && userAgent.includes('Chrome'),
      isFirefoxMobile: isMobile && userAgent.includes('Firefox'),
      isSafariMobile: isIOS && userAgent.includes('Safari'),
    };
  };

  // Función para obtener instrucciones específicas por navegador y dispositivo
  const getBrowserInstructions = () => {
    const deviceInfo = getDeviceAndBrowserInfo();
    
    // Instrucciones para dispositivos móviles
    if (deviceInfo.isMobile) {
      if (deviceInfo.isIOS) {
        return {
          title: "📱 iPhone/iPad",
          steps: [
            "1. Ve a Configuración de tu iPhone",
            "2. Busca y toca 'Safari'", 
            "3. Desactiva 'Bloquear ventanas emergentes'",
            "4. Regresa aquí y confirma de nuevo"
          ],
          showAlternative: true
        };
      }
      
      if (deviceInfo.isAndroid) {
        return {
          title: "📱 Android",
          steps: [
            "1. Toca los 3 puntos ⋮ (esquina superior)",
            "2. Configuración → Configuración de sitios",
            "3. 'Ventanas emergentes' → Permitir",
            "4. Regresa y confirma de nuevo"
          ],
          showAlternative: true
        };
      }
      
      // Móvil genérico
      return {
        title: "📱 Teléfono móvil",
        steps: [
          "1. Busca el menú de configuración del navegador",
          "2. Encuentra 'Pop-ups' o 'Ventanas emergentes'",
          "3. Permítelos para este sitio",
          "4. Regresa e intenta de nuevo"
        ],
        showAlternative: true
      };
    }
    
    // Instrucciones para escritorio (mantenemos las originales)
    if (deviceInfo.userAgent.includes('Chrome')) {
      return {
        title: "🖥️ Chrome",
        steps: [
          "1. Busca el ícono 🚫 en la barra de direcciones",
          "2. Haz clic en él y selecciona 'Permitir pop-ups'"
        ],
        showAlternative: false
      };
    }
    
    if (deviceInfo.userAgent.includes('Firefox')) {
      return {
        title: "🖥️ Firefox", 
        steps: [
          "1. Busca el escudo 🛡️ junto a la dirección",
          "2. Clic → Desactivar 'Bloquear ventanas emergentes'"
        ],
        showAlternative: false
      };
    }
    
    if (deviceInfo.userAgent.includes('Safari')) {
      return {
        title: "🖥️ Safari",
        steps: [
          "1. Safari → Preferencias → Sitios web",
          "2. Ventanas emergentes → Permitir para este sitio"
        ],
        showAlternative: false
      };
    }
    
    if (deviceInfo.userAgent.includes('Edge')) {
      return {
        title: "🖥️ Edge",
        steps: [
          "1. Busca el ícono 🚫 en la barra de direcciones",
          "2. Clic → 'Permitir ventanas emergentes'"
        ],
        showAlternative: false
      };
    }
    
    // Fallback genérico
    return {
      title: "🌐 Navegador",
      steps: [
        "Busca el ícono de pop-ups bloqueados en tu navegador",
        "y permítelos para este sitio"
      ],
      showAlternative: deviceInfo.isMobile
    };
  };

  // Función para copiar mensaje al portapapeles
  const copyMessageToClipboard = async () => {
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa tu nombre primero");
      return;
    }

    // Construir el mensaje igual que en processConfirmation
    const confirmacionTexto = formData.confirmacion === "si" ? "✅ ¡Confirmo mi asistencia!" : "❌ No podré asistir";
    const invitadosTexto = formData.numeroInvitados === 1 ? "1 persona" : `${formData.numeroInvitados} personas`;

    const mensaje = `🎉 *CONFIRMACIÓN DE ASISTENCIA* 🎉

👤 *Nombre:* ${formData.nombre}
${formData.telefono ? `📱 *Teléfono:* ${formData.telefono}` : ""}

${confirmacionTexto}
👥 *Número de invitados:* ${invitadosTexto}

${formData.mensaje ? `💌 *Mensaje especial:*\n${formData.mensaje}` : ""}

¡Gracias por responder! 💖✨`;

    try {
      await navigator.clipboard.writeText(mensaje);
      alert("✅ ¡Mensaje copiado! Ahora abre WhatsApp y envíalo a:\n+52 1 871 124 9363");
      setShowPopupModal(false);
      
      // Procesar confirmación automática en backend
      processConfirmation();
    } catch (error) {
      // Fallback si no funciona clipboard API
      prompt("Copia este mensaje y envíalo por WhatsApp:", mensaje);
      setShowPopupModal(false);
      processConfirmation();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numeroInvitados" ? parseInt(value) || 1 : value,
    }));
  };

  const handleConfirmAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar pop-ups bloqueados ANTES de procesar
    if (checkPopupBlocked()) {
      setShowPopupModal(true);
      return;
    }

    // Continuar con el procesamiento normal
    await processConfirmation();
  };

  const processConfirmation = async () => {
    // Validación simple
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    setIsSubmitting(true);

    // Construir el mensaje de WhatsApp
    const confirmacionTexto =
      formData.confirmacion === "si"
        ? "✅ ¡Confirmo mi asistencia!"
        : "❌ No podré asistir";

    const invitadosTexto =
      formData.numeroInvitados === 1
        ? "1 persona"
        : `${formData.numeroInvitados} personas`;

    const mensaje = `🎉 *CONFIRMACIÓN DE ASISTENCIA* 🎉

👤 *Nombre:* ${formData.nombre}
${formData.telefono ? `📱 *Teléfono:* ${formData.telefono}` : ""}

${confirmacionTexto}
👥 *Número de invitados:* ${invitadosTexto}

${formData.mensaje ? `💌 *Mensaje especial:*\n${formData.mensaje}` : ""}

¡Gracias por responder! 💖✨`;

    console.log("📝 Mensaje WhatsApp construido:", mensaje);

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensajeCodificado}`;

    try {
      // 🎯 NUEVA FUNCIONALIDAD: Llamar al endpoint de confirmación automática
      const confirmationData = {
        name: formData.nombre.trim(),
        numberOfGuests: formData.numeroInvitados,
        willAttend: formData.confirmacion === "si",
        comments: formData.mensaje?.trim() || undefined,
        phone: formData.telefono?.trim() || undefined,
      };

      console.log("🎯 Enviando confirmación automática...", confirmationData);

      const response = await fetch("/api/guests/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmationData),
      });

      const result = await response.json();

      if (result.success) {
        // Log transparente para debugging (como especificado)
        console.log("🎯 Confirmación procesada exitosamente:", {
          action: result.action,
          guest: result.guest.name,
          similarity: result.matchInfo?.similarity,
          matchType: result.matchInfo?.matchType,
          willAttend: confirmationData.willAttend,
          numberOfGuests: confirmationData.numberOfGuests,
        });

        if (result.action === "updated") {
          const matchMethod =
            result.matchInfo?.matchMethod === "phone" ? "teléfono" : "nombre";
          const conflictInfo = result.matchInfo?.hasConflict
            ? " (⚠️ números diferentes)"
            : "";
          console.log(
            `✅ Invitado actualizado por ${matchMethod}: "${
              result.guest.name
            }" (${result.matchInfo?.similarity?.toFixed(
              1
            )}% similitud)${conflictInfo}`
          );

          if (result.matchInfo?.hasConflict) {
            console.log(
              `⚠️ Se detectó un conflicto de teléfono - verificar manualmente`
            );
          }
        } else if (result.action === "created") {
          console.log(`🆕 Nuevo invitado creado: "${result.guest.name}"`);
          if (result.matchInfo?.multipleMatches) {
            console.log(
              `⚠️ Búsqueda ambigua: ${result.matchInfo.matchesCount} coincidencias similares encontradas`
            );
          }
        }
      } else {
        console.error("❌ Error en confirmación automática:", result.message);
      }
    } catch (error) {
      console.error("❌ Error procesando confirmación automática:", error);
      // No mostrar error al usuario - mantener transparencia como especificado
    }

    // Simular delay de envío y abrir WhatsApp (funcionalidad original)
    setTimeout(() => {
      console.log("📱 Abriendo WhatsApp...", whatsappUrl);

      // Abrir WhatsApp
      const whatsappWindow = window.open(whatsappUrl, "_blank");

      if (whatsappWindow) {
        console.log("✅ WhatsApp abierto exitosamente");
      } else {
        console.error(
          "❌ No se pudo abrir WhatsApp - posible bloqueador de pop-ups"
        );

        // Mostrar el mensaje con opción de copiar
        const confirmarCopia = confirm(
          "¡Tu confirmación fue guardada exitosamente! 🎉\n\n" +
            "No se pudo abrir WhatsApp automáticamente (bloqueador de pop-ups).\n\n" +
            "¿Quieres copiar el mensaje para enviarlo manualmente?"
        );

        if (confirmarCopia) {
          // Copiar mensaje al portapapeles
          navigator.clipboard
            .writeText(mensaje)
            .then(() => {
              alert(
                "✅ Mensaje copiado al portapapeles!\n\n" +
                  "Ahora abre WhatsApp manualmente y envía el mensaje a:\n" +
                  "+52 1 713 119 1636"
              );
            })
            .catch(() => {
              // Fallback si no se puede copiar automáticamente
              prompt("Copia este mensaje y envíalo por WhatsApp:", mensaje);
            });
        }
      }

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setIsSubmitting(false);

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          nombre: "",
          telefono: "",
          numeroInvitados: 1,
          confirmacion: "si",
          mensaje: "",
        });
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Componente Modal para Pop-up Blocker
  const PopupBlockerModal = () => {
    const instructions = getBrowserInstructions();
    const deviceInfo = getDeviceAndBrowserInfo();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white p-6 rounded-3xl max-w-md w-full text-center shadow-2xl border-2 max-h-[90vh] overflow-y-auto"
          style={{
            background: "linear-gradient(135deg, rgba(255, 179, 217, 0.15) 0%, rgba(248, 246, 240, 0.98) 25%, rgba(230, 217, 255, 0.15) 50%, rgba(255, 242, 204, 0.2) 75%, rgba(253, 252, 252, 0.98) 100%)",
            borderImage: "linear-gradient(45deg, var(--color-aurora-oro), var(--color-aurora-rosa), var(--color-aurora-lavanda)) 1",
          }}
        >
          {/* Ícono explicativo */}
          <div className="text-5xl mb-4">🚫➡️📱</div>
          
          <h3 
            className="text-xl font-bold mb-3"
            style={{ color: "var(--color-aurora-lavanda)" }}
          >
            Pop-ups Bloqueados
          </h3>
          
          <p 
            className="text-base mb-4 leading-relaxed"
            style={{ color: "var(--color-aurora-rosa)" }}
          >
            Para abrir WhatsApp automáticamente:
          </p>
          
          {/* Instrucciones específicas */}
          <div 
            className="p-4 rounded-2xl mb-4 text-left border"
            style={{
              backgroundColor: "rgba(255, 242, 204, 0.3)",
              borderColor: "rgba(255, 179, 217, 0.3)",
              color: "var(--color-aurora-lavanda)"
            }}
          >
            <h4 className="font-bold mb-2 text-center">{instructions.title}</h4>
            <div className="text-sm leading-relaxed">
              {instructions.steps.map((step, index) => (
                <div key={index} className="mb-1">{step}</div>
              ))}
            </div>
          </div>

          {/* Alternativa para móviles */}
          {instructions.showAlternative && (
            <div 
              className="p-3 rounded-xl mb-4 text-center border-2 border-dashed"
              style={{
                backgroundColor: "rgba(255, 179, 217, 0.1)",
                borderColor: "var(--color-aurora-rosa)"
              }}
            >
              <p 
                className="text-sm font-medium mb-3"
                style={{ color: "var(--color-aurora-rosa)" }}
              >
                ¿Te parece complicado? 🤔
              </p>
              <button
                onClick={copyMessageToClipboard}
                className="w-full px-4 py-3 rounded-2xl font-medium transition-all duration-300 hover:opacity-90 shadow-lg mb-2"
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "white"
                }}
              >
                📋 Copiar mensaje y enviar manualmente
              </button>
              <p className="text-xs opacity-75" style={{ color: "var(--color-aurora-lavanda)" }}>
                📱 WhatsApp: +52 1 871 124 9363
              </p>
            </div>
          )}
          
          {/* Botones principales */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button 
              onClick={() => setShowPopupModal(false)}
              className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: "rgba(156, 163, 175, 0.8)",
                color: "white"
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                setShowPopupModal(false);
                // Continuar con el proceso normal después de que el usuario permita pop-ups
                processConfirmation();
              }}
              className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:opacity-90 shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--color-aurora-rosa), var(--color-aurora-lavanda))",
                color: "white"
              }}
            >
              ✅ Ya permití, continuar
            </button>
          </div>

          {/* Solo para desktop - opción alternativa al final */}
          {!deviceInfo.isMobile && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">¿No funciona?</p>
              <button
                onClick={copyMessageToClipboard}
                className="text-sm underline hover:no-underline transition-all"
                style={{ color: "var(--color-aurora-lavanda)" }}
              >
                Copiar mensaje manualmente
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      style={{
        /* background: "url('/images/fondoAzul2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", */
        backgroundColor: "#fff",
      }}
      className="relative py-20 px-4"
    >
      {/* Elementos decorativos de fondo */}
      <div 
      style={{
        display: 'none'
      }}
      className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 w-32 h-32 opacity-20 animate-vip-float-aurora"
          style={{ color: "var(--color-aurora-rosa)" }}
        >
          <Heart className="w-full h-full" />
        </div>
        <div
          className="absolute bottom-20 right-16 w-24 h-24 opacity-15 animate-vip-pulse-aurora"
          style={{ color: "var(--color-aurora-lavanda)" }}
        >
          <Sparkles className="w-full h-full" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative bg-slate-300 bg-opacity-50 rounded-3xl">
        <div
          className="rounded-3xl p-10 shadow-2xl backdrop-blur-sm border-2 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 179, 217, 0.08) 0%, rgba(248, 246, 240, 0.95) 25%, rgba(230, 217, 255, 0.08) 50%, rgba(255, 242, 204, 0.12) 75%, rgba(253, 252, 252, 0.95) 100%)",
            borderImage:
              "linear-gradient(45deg, var(--color-aurora-oro), var(--color-aurora-rosa), var(--color-aurora-lavanda)) 1",
          }}
        >
          {/* Shimmer effect decorativo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aurora-oro to-transparent animate-vip-shimmer-aurora opacity-60"></div>

          {/* Header con icono y título */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg animate-vip-pulse-aurora"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-aurora-rosa), var(--color-aurora-lavanda))",
              }}
            >
              <Heart className="w-10 h-10 text-white" />
            </div>

            <h3
              className="text-4xl font-main-text font-bold mb-4 leading-tight text-purple-600"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))",
                WebkitBackgroundClip: "text",
                //WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              💌 Confirma tu Asistencia
            </h3>

            <p
              className="text-xl leading-relaxed max-w-lg mx-auto"
              style={{ color: "var(--color-aurora-rosa)" }}
            >
              ¿Nos acompañarás en este día tan especial?
              <br />
              <span className="font-medium">
                Confirma tu asistencia y comparte este momento único
              </span>
            </p>
          </div>

          {/* Formulario mejorado */}
          <form onSubmit={handleConfirmAttendance} className="space-y-6">
            {/* Mensaje de éxito */}
            {showSuccess && (
              <div
                className="text-center p-4 rounded-2xl mb-6 animate-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 179, 217, 0.2), rgba(230, 217, 255, 0.2))",
                  border: "2px solid var(--color-aurora-rosa)",
                }}
              >
                <div className="text-2xl mb-2">✅ ¡Confirmación Enviada!</div>
                <p style={{ color: "var(--color-aurora-lavanda)" }}>
                  WhatsApp se abrirá automáticamente con tu mensaje de
                  confirmación
                </p>
              </div>
            )}

            {/* Campo Nombre */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-aurora-lavanda opacity-70" />
              </div>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                required
                disabled={isSubmitting}
                className="w-full text-black pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg placeholder-opacity-60 disabled:opacity-50"
                style={{
                  background: "rgba(253, 252, 252, 0.8)",
                  borderColor: "rgba(255, 242, 204, 0.4)",
                  //color: "var(--color-aurora-lavanda)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-aurora-rosa)";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(255, 179, 217, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 242, 204, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Campo Teléfono */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-aurora-lavanda opacity-70" />
              </div>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Tu número de teléfono"
                disabled={isSubmitting}
                className="w-full text-black pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg placeholder-opacity-60 disabled:opacity-50"
                style={{
                  background: "rgba(253, 252, 252, 0.8)",
                  borderColor: "rgba(255, 242, 204, 0.4)",
                  //color: "var(--color-aurora-lavanda)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-aurora-rosa)";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(255, 179, 217, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 242, 204, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Campo Confirmación de Asistencia */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CheckCircle className="h-5 w-5 text-aurora-lavanda opacity-70" />
              </div>
              <select
                name="confirmacion"
                value={formData.confirmacion}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full text-black pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg disabled:opacity-50 appearance-none cursor-pointer"
                style={{
                  background: "rgba(253, 252, 252, 0.8)",
                  borderColor: "rgba(255, 242, 204, 0.4)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-aurora-rosa)";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(255, 179, 217, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 242, 204, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="si">✅ Sí, confirmo mi asistencia</option>
                <option value="no">❌ No podré asistir</option>
              </select>
            </div>

            {/* Campo Número de Invitados */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-aurora-lavanda opacity-70" />
              </div>
              <select
                name="numeroInvitados"
                value={formData.numeroInvitados}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full text-black pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg disabled:opacity-50 appearance-none cursor-pointer"
                style={{
                  background: "rgba(253, 252, 252, 0.8)",
                  borderColor: "rgba(255, 242, 204, 0.4)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-aurora-rosa)";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(255, 179, 217, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 242, 204, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value={1}>1 persona</option>
                <option value={2}>2 personas</option>
                <option value={3}>3 personas</option>
                <option value={4}>4 personas</option>
                <option value={5}>5 personas</option>
                <option value={6}>6+ personas</option>
              </select>
            </div>

            {/* Campo Mensaje */}
            <div className="relative group">
              <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                <MessageCircle className="h-5 w-5 text-aurora-lavanda opacity-70" />
              </div>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                placeholder="Mensaje especial (opcional)..."
                rows={4}
                disabled={isSubmitting}
                className="w-full text-black pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg placeholder-opacity-60 resize-none disabled:opacity-50"
                style={{
                  background: "rgba(253, 252, 252, 0.8)",
                  borderColor: "rgba(255, 242, 204, 0.4)",
                  //color: "var(--color-aurora-lavanda)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-aurora-rosa)";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(255, 179, 217, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 242, 204, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Botón de confirmación mejorado */}
            <div className="pt-4 text-center">
              <Button
                size="lg"
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="relative overflow-hidden text-white rounded-full py-8 px-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 text-lg font-semibold group min-w-[200px] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: showSuccess
                    ? "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)"
                    : "linear-gradient(135deg, #aaa 0%, #bbb 50%, #ccc 100%)",
                  border: "2px solid rgba(255, 242, 204, 0.5)",
                }}
              >
                {/* Efecto shimmer en el botón */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

                <div className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Preparando mensaje...
                    </>
                  ) : showSuccess ? (
                    <>
                      <span className="text-2xl mr-2">✅</span>
                      <span>¡Enviado a WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                      <h6 className="text-purple-700 flex flex-col md:flex-row gap-2 items-center justify-center">
                        <span>✨ Confirmar</span>
                        <span>Asistencia</span>
                      </h6>
                    </>
                  )}
                </div>
              </Button>

              {/* Texto informativo debajo del botón */}
              <p className="mt-4 text-sm opacity-75 text-pink-500 bg-emerald-200 bg-opacity-50 p-4 rounded-xl">
                {showSuccess
                  ? "¡Gracias por confirmar! Te esperamos en esta celebración especial 🎉"
                  : "Al confirmar, recibirás todos los detalles por WhatsApp 💌"}
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal para Pop-up Blocker */}
      {showPopupModal && <PopupBlockerModal />}
    </section>
  );
};

export default AttendanceConfirmation;
