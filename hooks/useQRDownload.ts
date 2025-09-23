"use client";

import { useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import {
  QREventData,
  DownloadFormat,
  QRDownloadState,
  QRDownloadHook,
} from "@/types/qrDownload.types";

import {
  FORMAT_CONFIGS,
  generateFileName,
  validateEventData,
  dataURLtoBlob,
  triggerDownload,
  calculateOptimalDimensions,
  logDownloadEvent,
  getErrorMessage,
} from "@/utils/qrDownloadHelpers";

export const useQRDownload = (eventData: QREventData): QRDownloadHook => {
  // Estado principal del hook
  const [state, setState] = useState<QRDownloadState>({
    isGenerating: false,
    downloadProgress: 0,
    error: null,
    previewUrl: null,
    currentFormat: null,
  });

  // Ref para el componente de descarga attachado externamente
  const downloadCardRef = useRef<HTMLDivElement>(null);

  // Actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<QRDownloadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Validar datos del evento
  const validateQRData = useCallback((): boolean => {
    try {
      const isValid = validateEventData(eventData);
      if (!isValid) {
        updateState({ error: "Los datos del evento no son válidos" });
      }
      return isValid;
    } catch (error) {
      updateState({ error: getErrorMessage(error) });
      return false;
    }
  }, [eventData, updateState]);

  // Generar QR Code como Data URL
  const generateQRDataURL = useCallback(async (): Promise<string> => {
    try {
      updateState({ downloadProgress: 10 });

      const qrDataURL = await QRCode.toDataURL(eventData.qrCodeUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      updateState({ downloadProgress: 25 });
      return qrDataURL;
    } catch (error) {
      throw new Error(`Error generando QR: ${getErrorMessage(error)}`);
    }
  }, [eventData.qrCodeUrl, updateState]);

  // Capturar elemento como canvas
  const captureElementAsCanvas = useCallback(
    async (
      element: HTMLElement,
      format: DownloadFormat
    ): Promise<HTMLCanvasElement> => {
      try {
        updateState({ downloadProgress: 40 });

        // Esperar a que las imágenes se carguen
        await new Promise((resolve) => setTimeout(resolve, 1000));

        updateState({ downloadProgress: 50 });

        const config = FORMAT_CONFIGS[format];

        // Para PDF, usar dimensiones más altas para mejor calidad
        const captureOptions =
          format === "pdf"
            ? {
                width: 1600, // Mayor resolución para PDF
                height: 2000,
                useCORS: true,
                allowTaint: false,
                background: config.backgroundColor || "#FFFFFF",
                scale: 3, // Factor de escala alto para máxima calidad
                logging: process.env.NODE_ENV === "development",
              }
            : {
                width: 800,
                height: 1000,
                useCORS: true,
                allowTaint: false,
                background: config.backgroundColor || "#FFFFFF",
                logging: process.env.NODE_ENV === "development",
              };

        const canvas = await html2canvas(element, captureOptions);

        console.log(`Canvas capturado para ${format}:`, {
          dimensions: `${canvas.width}x${canvas.height}px`,
          element: `${element.offsetWidth}x${element.offsetHeight}px`,
        });

        updateState({ downloadProgress: 75 });
        return canvas;
      } catch (error) {
        throw new Error(`Error capturando elemento: ${getErrorMessage(error)}`);
      }
    },
    [updateState]
  );

  
  // Versión mejorada del método downloadAsPDF
  const downloadAsPDF = useCallback(async (): Promise<void> => {
    const startTime = Date.now();

    try {
      if (!validateQRData()) return;

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "pdf",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente de descarga no encontrado");
      }

      const element = downloadCardRef.current;

      // 1. OBTENER DIMENSIONES REALES DEL CONTENIDO
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      console.log("🔍 Análisis del elemento:", {
        boundingRect: `${rect.width}x${rect.height}px`,
        offsetDimensions: `${element.offsetWidth}x${element.offsetHeight}px`,
        scrollDimensions: `${element.scrollWidth}x${element.scrollHeight}px`,
        computedStyle: {
          width: computedStyle.width,
          height: computedStyle.height,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
        },
      });

      updateState({ downloadProgress: 20 });

      // 2. CONFIGURACIÓN MEJORADA PARA html2canvas
      const contentWidth = Math.max(
        rect.width,
        element.offsetWidth,
        element.scrollWidth
      );
      const contentHeight = Math.max(
        rect.height,
        element.offsetHeight,
        element.scrollHeight
      );

      // Asegurar dimensiones mínimas
      const minWidth = 800;
      const minHeight = 1000;

      const finalWidth = Math.max(contentWidth, minWidth);
      const finalHeight = Math.max(contentHeight, minHeight);

      const captureOptions = {
        width: finalWidth,
        height: finalHeight,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        scale: 2, // Escala razonable para calidad
        scrollX: 0,
        scrollY: 0,
        windowWidth: finalWidth,
        windowHeight: finalHeight,
        logging: process.env.NODE_ENV === "development",
      };

      console.log("🎯 Configuración de captura:", captureOptions);

      updateState({ downloadProgress: 30 });

      // 3. ESPERAR A QUE TODO SE RENDERICE
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateState({ downloadProgress: 40 });

      // 4. CAPTURAR CANVAS
      const canvas = await html2canvas(element, captureOptions);

      console.log("📸 Canvas generado:", {
        dimensions: `${canvas.width}x${canvas.height}px`,
        hasContent: canvas.width > 0 && canvas.height > 0,
      });

      updateState({ downloadProgress: 60 });

      // 5. VERIFICAR QUE EL CANVAS TIENE CONTENIDO
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("El canvas generado está vacío");
      }

      // 6. CREAR PDF CON PROPORCIONES CORRECTAS
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // 7. CALCULAR ESCALADO MANTENIENDO PROPORCIONES
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalPdfWidth, finalPdfHeight, offsetX, offsetY;

      if (canvasRatio > pdfRatio) {
        // El contenido es más ancho proporcionalmente
        finalPdfWidth = pdfWidth;
        finalPdfHeight = pdfWidth / canvasRatio;
        offsetX = 0;
        offsetY = (pdfHeight - finalPdfHeight) / 2;
      } else {
        // El contenido es más alto proporcionalmente
        finalPdfHeight = pdfHeight;
        finalPdfWidth = pdfHeight * canvasRatio;
        offsetX = (pdfWidth - finalPdfWidth) / 2;
        offsetY = 0;
      }

      console.log("📄 Configuración PDF:", {
        pdfSize: `${pdfWidth}x${pdfHeight}mm`,
        canvasRatio: canvasRatio.toFixed(3),
        pdfRatio: pdfRatio.toFixed(3),
        finalSize: `${finalPdfWidth.toFixed(1)}x${finalPdfHeight.toFixed(1)}mm`,
        offset: `${offsetX.toFixed(1)}, ${offsetY.toFixed(1)}mm`,
        scaling:
          canvasRatio > pdfRatio ? "Ajustado por ancho" : "Ajustado por altura",
      });

      updateState({ downloadProgress: 80 });

      // 8. AGREGAR IMAGEN AL PDF MANTENIENDO PROPORCIONES
      pdf.addImage(
        imgData,
        "JPEG",
        offsetX,
        offsetY,
        finalPdfWidth,
        finalPdfHeight,
        undefined,
        "FAST"
      );

      updateState({ downloadProgress: 90 });

      // 9. GENERAR Y DESCARGAR
      const pdfBlob = pdf.output("blob");
      const fileName = generateFileName("pdf", eventData);

      triggerDownload(pdfBlob, fileName);

      updateState({ downloadProgress: 100 });
      logDownloadEvent("pdf", true, Date.now() - startTime);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error("❌ Error en downloadAsPDF:", error);
      updateState({ error: errorMsg });
      logDownloadEvent("pdf", false, Date.now() - startTime, errorMsg);
    } finally {
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
      }, 1000);
    }
  }, [eventData, validateQRData, updateState]);

  // FUNCIÓN AUXILIAR PARA DEBUGGING
  const debugElementDimensions = useCallback(() => {
    if (!downloadCardRef.current) return;

    const element = downloadCardRef.current;
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);

    console.log("🔧 DEBUG - Dimensiones del elemento:", {
      elemento:
        element.tagName + (element.className ? `.${element.className}` : ""),
      boundingClientRect: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
      offset: {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: element.offsetTop,
        left: element.offsetLeft,
      },
      scroll: {
        width: element.scrollWidth,
        height: element.scrollHeight,
      },
      computed: {
        width: computed.width,
        height: computed.height,
        display: computed.display,
        visibility: computed.visibility,
        position: computed.position,
        transform: computed.transform,
      },
      children: element.children.length,
      textContent: element.textContent?.substring(0, 50) + "...",
    });
  }, []);

  // Descargar como PNG
  const downloadAsPNG = useCallback(async (): Promise<void> => {
    const startTime = Date.now();

    try {
      if (!validateQRData()) return;

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "png",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente de descarga no encontrado");
      }

      const canvas = await captureElementAsCanvas(
        downloadCardRef.current,
        "png"
      );

      updateState({ downloadProgress: 90 });

      // Convertir a blob PNG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Error generando imagen PNG");
          }

          const fileName = generateFileName("png", eventData);
          triggerDownload(blob, fileName);

          updateState({ downloadProgress: 100 });
          logDownloadEvent("png", true, Date.now() - startTime);
        },
        "image/png",
        FORMAT_CONFIGS.png.quality
      );
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      updateState({ error: errorMsg });
      logDownloadEvent("png", false, Date.now() - startTime, errorMsg);
    } finally {
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
      }, 1000);
    }
  }, [eventData, validateQRData, updateState, captureElementAsCanvas]);

  // Descargar como JPG
  const downloadAsJPG = useCallback(async (): Promise<void> => {
    const startTime = Date.now();

    try {
      if (!validateQRData()) return;

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "jpg",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente de descarga no encontrado");
      }

      const canvas = await captureElementAsCanvas(
        downloadCardRef.current,
        "jpg"
      );

      updateState({ downloadProgress: 90 });

      // Convertir a blob JPG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Error generando imagen JPG");
          }

          const fileName = generateFileName("jpg", eventData);
          triggerDownload(blob, fileName);

          updateState({ downloadProgress: 100 });
          logDownloadEvent("jpg", true, Date.now() - startTime);
        },
        "image/jpeg",
        FORMAT_CONFIGS.jpg.quality
      );
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      updateState({ error: errorMsg });
      logDownloadEvent("jpg", false, Date.now() - startTime, errorMsg);
    } finally {
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
      }, 1000);
    }
  }, [eventData, validateQRData, updateState, captureElementAsCanvas]);

  // Generar preview
  const generatePreview = useCallback(
    async (format: DownloadFormat): Promise<string> => {
      try {
        if (!downloadCardRef.current) {
          throw new Error("Componente de descarga no encontrado");
        }

        const canvas = await captureElementAsCanvas(
          downloadCardRef.current,
          format
        );
        const previewDataURL = canvas.toDataURL("image/jpeg", 0.8);

        updateState({ previewUrl: previewDataURL });
        return previewDataURL;
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        updateState({ error: errorMsg });
        throw error;
      }
    },
    [updateState, captureElementAsCanvas]
  );

  // Generar nombre de archivo
  const getFileName = useCallback(
    (format: DownloadFormat): string => {
      return generateFileName(format, eventData);
    },
    [eventData]
  );

  // Limpiar error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Reset completo del estado
  const resetState = useCallback(() => {
    updateState({
      isGenerating: false,
      downloadProgress: 0,
      error: null,
      previewUrl: null,
      currentFormat: null,
    });
  }, [updateState]);

  // Exponer ref para que los componentes puedan usarlo
  const attachDownloadRef = useCallback((element: HTMLDivElement | null) => {
    if (element && downloadCardRef.current !== element) {
      downloadCardRef.current = element;
    }
  }, []);

  return {
    // Estados
    isGenerating: state.isGenerating,
    downloadProgress: state.downloadProgress,
    error: state.error,
    previewUrl: state.previewUrl,
    currentFormat: state.currentFormat,

    // Acciones principales
    downloadAsPDF,
    downloadAsPNG,
    downloadAsJPG,

    // Utilidades
    generatePreview,
    getFileName,
    validateQRData,
    clearError,
    resetState,

    // Ref para componente
    attachDownloadRef,
  };
};
