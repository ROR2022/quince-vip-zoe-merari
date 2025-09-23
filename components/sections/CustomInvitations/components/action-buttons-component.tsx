// ================================================================
// 📁 components/ActionButtons.tsx
// ================================================================

import React, {useState} from 'react';
import { ActionButtonsProps } from '../types/invitation.types';
import { sendWhatsAppInvitationWithRegistration } from '../utils/invitation.utils';

/**
 * Componente para los botones de acción principal
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  formData,
  uiState,
  onTogglePreview,
  onDownload,
}) => {
  // Verificar si todos los campos requeridos están completos
  const isFormComplete = !!(
    formData.guestName &&
    formData.personalMessage &&
    formData.numberOfGuests &&
    formData.whatsappNumber &&
    formData.whatsappNumber.replace(/\D/g, "").length === 10
  );
  const [isSending, setIsSending] = useState(false);

  
  // Función para enviar por WhatsApp con registro automático en BD
  const sendWhatsAppInvitation = async (): Promise<void> => {
    if (!isFormComplete) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSending(true);
    
    try {
      const success = await sendWhatsAppInvitationWithRegistration(formData);
      
      if (success) {
        // Mostrar mensaje de éxito más detallado
        console.log(`✅ ¡Perfecto! 

📱 Invitación enviada a ${formData.guestName} por WhatsApp
📝 Registrado automáticamente en el sistema de gestión
🎯 Ahora puedes ver este invitado en la sección "Gestión de Invitados"`);
      } else {
        console.error("❌ La invitación se abrió en WhatsApp, pero hubo un problema al registrar en el sistema. Puedes registrar manualmente en 'Gestión de Invitados'.");
      }
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      console.error("❌ Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-4">
      {/* Botón Ver/Ocultar Vista Previa */}
      <button
        type="button"
        onClick={onTogglePreview}
        disabled={!isFormComplete}
        className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        title={!isFormComplete ? "Completa todos los campos para ver la vista previa" : ""}
      >
        {uiState.showPreview ? "🙈 Ocultar Vista Previa" : "👁️ Ver Vista Previa"}
      </button>

      {/* Botón Enviar por WhatsApp */}
      <button
        type="button"
        onClick={sendWhatsAppInvitation}
        disabled={!isFormComplete}
        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        title={!isFormComplete ? "Completa todos los campos para enviar por WhatsApp" : ""}
      >
        {isSending ? "⏳ Enviando..." : "📱 Enviar por WhatsApp"}
      </button>

      {/* Botón Descargar Imagen */}
      <button
        type="button"
        onClick={onDownload}
        disabled={uiState.isDownloading || !isFormComplete || !uiState.showPreview}
        className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-700 hover:from-fuchsia-600 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        title={
          !isFormComplete 
            ? "Completa todos los campos para descargar" 
            : !uiState.showPreview 
            ? "Primero ve la vista previa para descargar"
            : ""
        }
      >
        {uiState.isDownloading ? "⏳ Descargando..." : "💾 Descargar Imagen"}
      </button>
    </div>
  );
};
