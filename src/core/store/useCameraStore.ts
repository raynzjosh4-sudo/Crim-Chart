import { create } from 'zustand';

interface CameraState {
  capturedImage: string | null;
  setCapturedImage: (uri: string | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  capturedImage: null,
  setCapturedImage: (uri) => set({ capturedImage: uri }),
}));
