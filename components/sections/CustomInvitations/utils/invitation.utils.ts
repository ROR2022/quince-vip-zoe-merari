// ================================================================
// 📁 utils/invitation.utils.ts
// ================================================================

import { FormData, ValidationResult } from '../types/invitation.types';
import { EVENT_INFO, VALIDATION_MESSAGES, PHONE_CONFIG } from '../constants/invitation.constants';

/**
 * Formatea un número de teléfono mexicano con espacios
 * @param value - Número de teléfono sin formato
 * @param previousValue - Valor anterior para detectar si está borrando
 * @returns Número formateado (XXX XXX XXXX)
 */
export const formatMexicanPhone = (value: string, previousValue?: string): string => {
  // Remover todo lo que no sean números
  const numbers = value.replace(/\D/g, "");
  
  // Si el valor actual es más corto que el anterior, el usuario está borrando
  const isDeleting = previousValue && value.length < previousValue.length;
  
  // Limitar a 10 dígitos máximo
  const limited = numbers.slice(0, PHONE_CONFIG.DIGITS_REQUIRED);
  
  // Si está borrando y el cursor está en un espacio, permitir que se borre
  if (isDeleting) {
    // Simplemente formatear los números que quedan
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  }
  
  // Formatear normalmente cuando está escribiendo
  if (limited.length >= 6) {
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  } else if (limited.length >= 3) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  }
  return limited;
};

/**
 * Genera el mensaje de WhatsApp personalizado
 * @param formData - Datos del formulario
 * @returns Mensaje formateado para WhatsApp
 */
export const generateWhatsAppMessage = (formData: FormData): string => {
  const guestText = parseInt(formData.numberOfGuests) === 1 ? 'persona' : 'personas';
  
  return `👑 ¡Hola ${formData.guestName}! 👑

${formData.personalMessage}

Tienes una invitación especial a la Quinceañera de:
✨ ${EVENT_INFO.quinceaneraName} ✨

📅 Fecha: ${EVENT_INFO.date}
🕖 Hora: ${EVENT_INFO.time}
📍 Lugar: ${EVENT_INFO.venue}
👥 Número de invitados: ${formData.numberOfGuests} ${guestText}

Ver tu invitación mágica aquí:
👉 ${EVENT_INFO.invitationUrl}

💜 ¡Espero que celebres con nosotros este día tan especial!

Con cariño,
${EVENT_INFO.quinceaneraName} 🎉`;
};

/**
 * Valida todos los campos del formulario
 * @param formData - Datos del formulario a validar
 * @returns Resultado de la validación
 */
export const validateForm = (formData: FormData): ValidationResult => {
  // Verificar campos requeridos
  if (!formData.guestName || !formData.whatsappNumber || !formData.numberOfGuests || !formData.personalMessage) {
    return { 
      isValid: false, 
      message: VALIDATION_MESSAGES.REQUIRED_FIELDS 
    };
  }
  
  // Validar número de teléfono
  const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.length !== PHONE_CONFIG.DIGITS_REQUIRED) {
    return { 
      isValid: false, 
      message: VALIDATION_MESSAGES.INVALID_PHONE 
    };
  }
  
  return { isValid: true };
};

/**
 * Valida específicamente el número de teléfono
 * @param phoneNumber - Número a validar
 * @returns Resultado de la validación
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  
  if (!phoneNumber.trim()) {
    return { isValid: false, message: "Número de teléfono es requerido" };
  }
  
  if (cleanNumber.length !== PHONE_CONFIG.DIGITS_REQUIRED) {
    return { 
      isValid: false, 
      message: VALIDATION_MESSAGES.INVALID_PHONE_FORMAT 
    };
  }
  
  return { isValid: true };
};

/**
 * Envía la invitación por WhatsApp
 * @param formData - Datos del formulario
 */
export const sendWhatsAppInvitation = (formData: FormData): void => {
  const validation = validateForm(formData);
  if (!validation.isValid) {
    console.error('❌ Validación fallida:', validation.message);
    return;
  }
  
  const message = generateWhatsAppMessage(formData);
  const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
  const mexicanNumber = `52${cleanNumber}`;
  const whatsappURL = `https://wa.me/${mexicanNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappURL, "_blank");
};

/**
 * Genera nombre de archivo para la descarga
 * @param guestName - Nombre del invitado
 * @returns Nombre de archivo formateado
 */
export const generateFileName = (guestName: string): string => {
  const cleanName = guestName
    .replace(/\s+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  
  return `invitacion_aurora_${cleanName}.png`;
};

/**
 * Verifica si todos los campos requeridos están completos
 * @param formData - Datos del formulario
 * @returns true si todos los campos requeridos están completos
 */
export const areRequiredFieldsComplete = (formData: FormData): boolean => {
  return !!(
    formData.guestName &&
    formData.personalMessage &&
    formData.numberOfGuests &&
    formData.whatsappNumber
  );
};

/**
 * Limpia y formatea texto para uso seguro
 * @param text - Texto a limpiar
 * @returns Texto limpio y seguro
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Convierte número de invitados a texto legible
 * @param numberOfGuests - Número como string
 * @returns Texto descriptivo (persona/personas)
 */
export const formatGuestText = (numberOfGuests: string): string => {
  const num = parseInt(numberOfGuests);
  return num === 1 ? 'persona' : 'personas';
};

/**
 * Valida que el nombre del invitado sea válido
 * @param name - Nombre a validar
 * @returns Resultado de la validación
 */
export const validateGuestName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, message: "El nombre del invitado es requerido" };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, message: "El nombre no puede exceder 50 caracteres" };
  }
  
  return { isValid: true };
};

/**
 * Valida que el mensaje personal sea válido
 * @param message - Mensaje a validar
 * @returns Resultado de la validación
 */
export const validatePersonalMessage = (message: string): ValidationResult => {
  const trimmedMessage = message.trim();
  
  if (!trimmedMessage) {
    return { isValid: false, message: "El mensaje personal es requerido" };
  }
  
  if (trimmedMessage.length < 10) {
    return { isValid: false, message: "El mensaje debe tener al menos 10 caracteres" };
  }
  
  if (trimmedMessage.length > 500) {
    return { isValid: false, message: "El mensaje no puede exceder 500 caracteres" };
  }
  
  return { isValid: true };
};

/**
 * Crea o actualiza un invitado en la base de datos al enviar invitación
 * @param formData - Datos del formulario de invitación
 * @returns Promise<boolean> - true si fue exitoso
 */
export const createOrUpdateGuestFromInvitation = async (formData: FormData): Promise<boolean> => {
  try {
    // Mapear guestRelation a los valores válidos del modelo
    const relationMap: Record<string, string> = {
      'familia': 'familia',
      'amigos': 'amigos', 
      'escuela': 'escuela',
      'trabajo': 'trabajo',
      'otros': 'otros',
      'amigo': 'amigos', // Mapeo adicional
      'familiar': 'familia'
    };

    // Preparar datos del invitado según esquema de GuestsManagement
    const guestData = {
      name: formData.guestName.trim(),
      phone: formData.whatsappNumber.replace(/\D/g, ''), // Solo números
      relation: relationMap[formData.guestRelation.toLowerCase()] || 'otros',
      personalInvitation: {
        sent: true,
        sentAt: new Date(),
        message: formData.personalMessage.trim(),
        numberOfGuests: parseInt(formData.numberOfGuests) || 1
      }
    };

    console.log('📤 Enviando datos de invitado:', guestData);

    // Intentar crear o actualizar el invitado
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Invitado registrado automáticamente:', result.data.name);
      return true;
    } else {
      console.error('❌ Error al registrar invitado:', result.error);
      // No bloqueamos el envío de WhatsApp por errores de BD
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión al registrar invitado:', error);
    // No bloqueamos el envío de WhatsApp por errores de conexión
    return false;
  }
};

/**
 * Envía la invitación por WhatsApp y registra automáticamente en la BD
 * @param formData - Datos del formulario
 * @returns Promise<boolean> - true si el envío fue exitoso
 */
export const sendWhatsAppInvitationWithRegistration = async (formData: FormData): Promise<boolean> => {
  const validation = validateForm(formData);
  if (!validation.isValid) {
    
    console.error('❌ Validación fallida:', validation.message);
    return false;
  }
  
  try {
    // 1. Registrar invitado en la base de datos (automático, no bloquea)
    await createOrUpdateGuestFromInvitation(formData);
    
    // 2. Generar mensaje y enviar por WhatsApp
    const message = generateWhatsAppMessage(formData);
    const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
    const mexicanNumber = `521${cleanNumber}`;
    const whatsappURL = `https://wa.me/${mexicanNumber}?text=${encodeURIComponent(message)}`;
    
    // 3. Abrir WhatsApp
    window.open(whatsappURL, "_blank");
    
    return true;
  } catch (error) {
    console.error('❌ Error en el envío de invitación:', error);
    return false;
  }
};