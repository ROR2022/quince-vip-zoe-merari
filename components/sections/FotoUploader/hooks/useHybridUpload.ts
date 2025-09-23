import { useState, useCallback, useRef } from 'react';
import { UploadState, UploaderFormData, UploadFile } from '../types/upload.types';
import { validateFileList, generateFileId } from '../utils/imageValidation';
// import { ERROR_MESSAGES } from '@/components/sections/FotoUploader/constants/upload.constants';

// Interfaz para los datos de Cloudinary
interface CloudinaryData {
  public_id: string;
  secure_url: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  bytes?: number;
}

// Interfaz para los resultados de upload
interface UploadResult {
  filename?: string;
  filePath?: string;
  cloudinaryData?: CloudinaryData;
  [key: string]: unknown;
}

// Interfaz para el registro en MongoDB
interface PhotoRegistration {
  filename: string;
  originalName: string;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  uploadSource: 'cloudinary' | 'local';
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  uploader: {
    name?: string;
    ip: string;
    userAgent: string;
  };
  eventMoment?: string;
  comment?: string;
}

/**
 * Hook híbrido para manejo de subida de archivos
 * Combina Cloudinary y sistema original con fallback automático
 */
export const useHybridUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const [systemType, setSystemType] = useState<'cloudinary' | 'original' | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Obtiene la IP del cliente
   */
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return '0.0.0.0';
    }
  };

  /**
   * Obtiene las dimensiones de una imagen
   */
  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  /**
   * Registra una foto en MongoDB
   */
  const registerPhotoInDB = useCallback(async (
    file: File,
    uploadResult: UploadResult,
    uploadSource: 'cloudinary' | 'local',
    formData?: UploaderFormData
  ): Promise<void> => {
    try {
      console.log('💾 Registering photo in MongoDB...', {
        filename: file.name,
        uploadSource,
        uploadResult
      });

      // Obtener IP del cliente
      const clientIP = await getClientIP();
      
      // Obtener dimensiones de la imagen
      const dimensions = await getImageDimensions(file);

      // Preparar datos para el registro
      const photoData: PhotoRegistration = {
        filename: uploadResult.filename || file.name,
        originalName: file.name,
        uploadSource,
        fileSize: file.size,
        mimeType: file.type,
        dimensions,
        uploader: {
          name: formData?.uploaderName || formData?.userName,
          ip: clientIP,
          userAgent: navigator.userAgent
        },
        eventMoment: formData?.eventMoment,
        comment: formData?.comment
      };

      // Agregar datos específicos según el tipo de upload
      if (uploadSource === 'cloudinary' && uploadResult.cloudinaryData) {
        photoData.cloudinaryId = uploadResult.cloudinaryData.public_id;
        photoData.cloudinaryUrl = uploadResult.cloudinaryData.secure_url;
      } else if (uploadSource === 'local' && uploadResult.filePath) {
        photoData.localPath = uploadResult.filePath;
      }

      // Registrar en MongoDB
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to register photo in MongoDB:', {
          status: response.status,
          error: errorText
        });
        // No lanzamos error para no fallar el upload, solo logueamos
        return;
      }

      const result = await response.json();
      console.log('✅ Photo registered successfully in MongoDB:', result);
      
    } catch (error) {
      console.error('❌ Error registering photo in MongoDB:', error);
      // No lanzamos error para no fallar el upload
    }
  }, []);

  /**
   * Sube archivos usando Cloudinary
   */
  const uploadWithCloudinary = useCallback(async (
    filesToUpload: UploadFile[],
    formData?: UploaderFormData
  ): Promise<boolean> => {
    try {
      console.log('🌩️ Attempting Cloudinary upload...');
      
      const uploadFormData = new FormData();
      
      // Agregar archivos con el nombre correcto que espera la API
      filesToUpload.forEach((fileObj) => {
        uploadFormData.append('files', fileObj.file);
      });

      // Agregar metadatos opcionales
      if (formData?.uploaderName) {
        uploadFormData.append('uploaderName', formData.uploaderName);
      }
      if (formData?.userName) {
        uploadFormData.append('userName', formData.userName);
      }
      if (formData?.eventMoment) {
        uploadFormData.append('eventMoment', formData.eventMoment);
      }
      if (formData?.comment) {
        uploadFormData.append('comment', formData.comment);
      }

      const response = await fetch('/api/upload-fotos-cloudinary', {
        method: 'POST',
        body: uploadFormData,
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Cloudinary upload successful:', result);

      // 🆕 Registrar automáticamente en MongoDB
      if (result.data && result.data.files && Array.isArray(result.data.files)) {
        for (let i = 0; i < result.data.files.length && i < filesToUpload.length; i++) {
          const uploadResult = result.data.files[i];
          const file = filesToUpload[i].file;
          
          // Convertir estructura de la API a la estructura esperada por registerPhotoInDB
          const adaptedResult: UploadResult = {
            filename: uploadResult.originalName,
            cloudinaryData: {
              public_id: uploadResult.cloudinaryId,
              secure_url: uploadResult.urls?.original || '',
              url: uploadResult.urls?.original || '',
              width: uploadResult.metadata?.width,
              height: uploadResult.metadata?.height,
              format: uploadResult.metadata?.format,
              bytes: uploadResult.metadata?.optimizedSize
            }
          };
          
          // Registrar cada archivo en MongoDB
          await registerPhotoInDB(file, adaptedResult, 'cloudinary', formData);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      return false;
    }
  }, [registerPhotoInDB]);

  /**
   * Sube archivos usando el sistema original
   */
  const uploadWithOriginal = useCallback(async (
    filesToUpload: UploadFile[],
    formData?: UploaderFormData
  ): Promise<boolean> => {
    try {
      console.log('📁 Using original upload system...');
      
      const uploadFormData = new FormData();
      
      // Agregar archivos
      filesToUpload.forEach((fileObj) => {
        uploadFormData.append('files', fileObj.file);
      });

      // Agregar metadatos opcionales
      if (formData?.uploaderName) {
        uploadFormData.append('uploaderName', formData.uploaderName);
      }
      if (formData?.userName) {
        uploadFormData.append('userName', formData.userName);
      }
      if (formData?.eventMoment) {
        uploadFormData.append('eventMoment', formData.eventMoment);
      }
      if (formData?.comment) {
        uploadFormData.append('comment', formData.comment);
      }

      const response = await fetch('/api/upload-fotos', {
        method: 'POST',
        body: uploadFormData,
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Original upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Original upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Original upload successful:', result);

      // 🆕 Registrar automáticamente en MongoDB
      if (result.uploads && Array.isArray(result.uploads)) {
        for (let i = 0; i < result.uploads.length && i < filesToUpload.length; i++) {
          const uploadResult = result.uploads[i];
          const file = filesToUpload[i].file;
          
          // Registrar cada archivo en MongoDB
          await registerPhotoInDB(file, uploadResult, 'local', formData);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Original upload error:', error);
      return false;
    }
  }, [registerPhotoInDB]);

  /**
   * Detecta automáticamente el sistema de subida disponible
   */
  const detectUploadSystem = useCallback(async (): Promise<'cloudinary' | 'original'> => {
    try {
      // Verificar si Cloudinary está configurado
      const cloudinaryResponse = await fetch('/api/upload-fotos-cloudinary', {
        method: 'GET'
      });
      
      if (cloudinaryResponse.status === 405) {
        // Método no permitido significa que el endpoint existe
        console.log('☁️ Cloudinary system detected and available');
        return 'cloudinary';
      }
    } catch {
      console.log('📁 Cloudinary not available, using original system');
    }

    return 'original';
  }, []);

  /**
   * Función principal de subida con sistema híbrido
   */
  const uploadFiles = useCallback(async (
    files: FileList | File[],
    formData?: UploaderFormData
  ) => {
    // Reiniciar estado
    setUploadState({
      files: [],
      uploading: true,
      progress: 0,
      error: null,
      success: false
    });

    // Crear AbortController para esta subida
    abortControllerRef.current = new AbortController();

    try {
      // Validar archivos
      const fileArray = Array.from(files);
      
      // Crear FileList mock para validación
      const fileList = {
        ...fileArray,
        item: (index: number) => fileArray[index] || null
      } as FileList;
      
      const validation = validateFileList(fileList);
      
      if (!validation.valid) {
        throw new Error(validation.error || 'Error de validación');
      }

      // Preparar archivos para subida
      const filesToUpload: UploadFile[] = fileArray.map(file => ({
        file,
        id: generateFileId(file),
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0
      }));

      // Actualizar estado con archivos preparados
      setUploadState(prev => ({
        ...prev,
        files: filesToUpload
      }));

      // Detectar sistema disponible
      const detectedSystemType = await detectUploadSystem();
      setSystemType(detectedSystemType);

      let uploadSuccess = false;

      // Intentar subida con Cloudinary primero
      if (detectedSystemType === 'cloudinary') {
        console.log('🌩️ Attempting Cloudinary upload...');
        uploadSuccess = await uploadWithCloudinary(filesToUpload, formData);
        
        // Si Cloudinary falla, hacer fallback al sistema original
        if (!uploadSuccess) {
          console.log('⚠️ Cloudinary failed, falling back to original system...');
          setSystemType('original');
          uploadSuccess = await uploadWithOriginal(filesToUpload, formData);
        }
      } else {
        // Usar sistema original directamente
        console.log('📁 Using original system directly...');
        uploadSuccess = await uploadWithOriginal(filesToUpload, formData);
      }

      if (uploadSuccess) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          success: true,
          progress: 100
        }));
      } else {
        throw new Error('All upload systems failed');
      }

      // Limpiar URLs de preview
      filesToUpload.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview);
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }));
    }
  }, [uploadWithCloudinary, uploadWithOriginal, detectUploadSystem]);

  /**
   * Cancela la subida en progreso
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setUploadState(prev => ({
      ...prev,
      uploading: false,
      error: 'Subida cancelada por el usuario',
      success: false
    }));
  }, []);

  /**
   * Reinicia el estado del hook
   */
  const resetUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setUploadState({
      files: [],
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    
    setSystemType(null);
  }, []);

  /**
   * Funciones para cambio manual de sistema (desarrollo)
   */
  const switchToOriginal = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      setSystemType('original');
    }
  }, []);

  const switchToCloudinary = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      setSystemType('cloudinary');
    }
  }, []);

  return {
    uploadState,
    systemType,
    uploadFiles,
    cancelUpload,
    resetUpload,
    // Funciones de desarrollo
    switchToOriginal,
    switchToCloudinary
  };
};
