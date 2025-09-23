// ================================================================
// 📁 constants/invitation.constants.ts
// ================================================================

import { EventInfo, RelationOption } from '../types/invitation.types';

export const ADMIN_PASSWORD = "aurora1234";

export const EVENT_INFO: EventInfo = {
  quinceaneraName: "Rosy Abigail",
  date: "Viernes 05 de Diciembre 2025",
  time: "7:00 PM",
  venue: "Salón de Eventos La Mansión",
  dressCode: "Formal -Rosa solo la quinceañera-",
  invitationUrl: "https://quince-vip-rosy-abigail.vercel.app/"
} as const;

export const SUGGESTED_MESSAGES = [
  "¡Querida amiga! Te invito a celebrar conmigo el día más mágico de mi vida. ¡Espero verte brillar junto a mí!",
  "¡Familia querida! Este día especial no sería lo mismo sin ustedes. ¡Los espero con mucho amor!",
  "¡Hola! Me encantaría que seas parte de mi celebración de XV años. ¡Será una noche inolvidable!",
  "¡Queridos padrinos! Su presencia es fundamental en este momento tan especial. ¡Los espero con cariño!",
  "¡Amigos del alma! Vengan a celebrar conmigo esta nueva etapa. ¡Será una fiesta increíble!"
] as const;

export const RELATION_OPTIONS: RelationOption[] = [
  { value: "", label: "Selecciona relación (opcional)" },
  { value: "familia", label: "👪 Familia" },
  { value: "amigos", label: "👭 Amigos" },
  { value: "padrinos", label: "🤝 Padrinos" },
  { value: "otros", label: "👥 Otros" }
] as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: "Por favor completa todos los campos obligatorios",
  INVALID_PHONE: "El número debe tener exactamente 10 dígitos",
  INVALID_PHONE_FORMAT: "Debe tener exactamente 10 dígitos",
  DOWNLOAD_SUCCESS: "¡Invitación descargada exitosamente!",
  DOWNLOAD_ERROR: "Error al descargar la invitación",
  AUTH_ERROR: "Contraseña incorrecta",
  DOWNLOAD_REQUIRED_FIELDS: "Por favor completa todos los campos obligatorios antes de descargar"
} as const;

export const UI_MESSAGES = {
  TOGGLE_PREVIEW_SHOW: "👁️ Ver Vista Previa",
  TOGGLE_PREVIEW_HIDE: "🙈 Ocultar Vista Previa",
  SEND_WHATSAPP: "📱 Enviar por WhatsApp",
  DOWNLOAD_READY: "💾 Descargar Imagen",
  DOWNLOAD_PROCESSING: "⏳ Generando imagen...",
  ACCESS_RESTRICTED: "🔐 Acceso Restringido",
  ADMIN_AUTHENTICATED: "Admin"
} as const;

export const PHONE_CONFIG = {
  COUNTRY_CODE: "+52",
  FLAG: "🇲🇽",
  MAX_LENGTH: 13,
  DIGITS_REQUIRED: 10,
  PLACEHOLDER: "555 123 4567"
} as const;

export const DOWNLOAD_CONFIG = {
  SCALE: 2,
  FORMAT: 'image/png' as const,
  QUALITY: 0.95,
  MIN_WIDTH: 600,
  MIN_HEIGHT: 800,
  FILE_PREFIX: "invitacion_aurora_"
} as const;

export const CSS_CLASSES = {
  GRADIENT_PRIMARY: "bg-gradient-to-r from-purple-700 via-fuchsia-500 to-purple-700",
  GRADIENT_SECONDARY: "bg-gradient-to-r from-fuchsia-500 to-purple-700",
  GRADIENT_SUCCESS: "bg-gradient-to-r from-green-500 to-green-600",
  GRADIENT_PREVIEW: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
  BORDER_FOCUS: "border-fuchsia-200 focus:ring-fuchsia-400 focus:ring-2 focus:border-transparent",
  BORDER_ERROR: "border-red-300 focus:ring-red-400"
} as const;