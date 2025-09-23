// ================================================================
// 📁 types/invitation.types.ts
// ================================================================

export interface FormData {
  guestName: string;
  guestRelation: string;
  personalMessage: string;
  numberOfGuests: string;
  whatsappNumber: string;
}

export type FormField = keyof FormData;

export interface AuthState {
  isAuthenticated: boolean;
  showAuthPopover: boolean;
  password: string;
  showPassword: boolean;
  authError: string;
}

export interface UIState {
  showPreview: boolean;
  isDownloading: boolean;
  downloadError: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface RelationOption {
  value: string;
  label: string;
}

export interface EventInfo {
  quinceaneraName: string;
  date: string;
  time: string;
  venue: string;
  dressCode: string;
  invitationUrl: string;
}

// Tipos para componentes
export interface AuthPanelProps {
  authState: AuthState;
  onUpdateAuth: (updates: Partial<AuthState>) => void;
  onAuthenticate: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

export interface InvitationFormProps {
  formData: FormData;
  onUpdateFormData: (field: FormField, value: string) => void;
}

export interface InvitationPreviewProps {
  formData: FormData;
}

export interface ActionButtonsProps {
  formData: FormData;
  uiState: UIState;
  onTogglePreview: () => void;
  onDownload: () => void;
}

// Tipos para hooks
export interface UseInvitationFormReturn {
  // Estados
  formData: FormData;
  authState: AuthState;
  uiState: UIState;
  
  // Funciones de actualización
  updateFormData: (field: FormField, value: string) => void;
  updateAuthState: (updates: Partial<AuthState>) => void;
  updateUIState: (updates: Partial<UIState>) => void;
  
  // Funciones específicas
  handleAuthentication: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
  resetForm: () => void;
  clearErrors: () => void;
  logout: () => void;
  togglePreview: () => void;
  setDownloadState: (isDownloading: boolean, error?: string) => void;
  
  // Funciones de validación
  isFormValid: () => boolean;
  isPhoneValid: () => boolean;
  getRemainingChars: (field: FormField, maxLength: number) => number;
}

// Tipos para servicios
export interface DownloadCallbacks {
  onStart: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export interface Html2CanvasOptions {
  scale: number;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string | null;
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  windowWidth: number;
  windowHeight: number;
}