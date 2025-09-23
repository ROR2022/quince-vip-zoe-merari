// 📸 Image Validation - Utilidades para validar archivos de imagen

import { ValidationResult } from '../types/upload.types';
import { UPLOAD_CONFIG, ERROR_MESSAGES, ALLOWED_EXTENSIONS } from '../constants/upload.constants';

/**
 * Valida si un archivo es una imagen válida
 */
export const validateImageFile = (file: File): ValidationResult => {
  // Validar tipo MIME
  if (!UPLOAD_CONFIG.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FORMAT
    };
  }

  // Validar extensión del archivo
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FORMAT
    };
  }

  // Validar tamaño del archivo
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }

  return { valid: true };
};

/**
 * Valida una lista de archivos
 */
export const validateFileList = (files: FileList): ValidationResult => {
  // Validar cantidad de archivos
  if (files.length > UPLOAD_CONFIG.maxFiles) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TOO_MANY_FILES
    };
  }

  // Validar cada archivo individualmente
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};

/**
 * Valida las dimensiones de una imagen
 */
export const validateImageDimensions = (
  image: HTMLImageElement
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const { maxWidth, maxHeight } = UPLOAD_CONFIG.compressionOptions;
    
    if (image.width > maxWidth || image.height > maxHeight) {
      // Las dimensiones exceden el límite, pero esto no es un error
      // ya que podemos comprimirlas automáticamente
      resolve({ 
        valid: true 
      });
    } else {
      resolve({ valid: true });
    }
  });
};

/**
 * Genera un ID único para un archivo
 */
export const generateFileId = (file: File): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '');
  return `${timestamp}_${random}_${fileName.substr(0, 10)}`;
};

/**
 * Obtiene información detallada de un archivo
 */
export const getFileInfo = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size)
  };
};

/**
 * Formatea el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Verifica si el navegador soporta las características necesarias
 */
export const checkBrowserSupport = (): ValidationResult => {
  // Verificar File API
  if (!window.File || !window.FileReader || !window.FileList) {
    return {
      valid: false,
      error: 'Tu navegador no soporta la subida de archivos.'
    };
  }

  // Verificar Canvas API para compresión
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    return {
      valid: false,
      error: 'Tu navegador no soporta el procesamiento de imágenes.'
    };
  }

  return { valid: true };
};
