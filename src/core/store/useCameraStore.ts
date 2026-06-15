import { create } from 'zustand';

interface CameraState {
  capturedImage: string | null;
  capturedVideo: string | null;
  setCapturedImage: (uri: string | null) => void;
  setCapturedVideo: (uri: string | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  capturedImage: null,
  capturedVideo: null,
  setCapturedImage: (uri) => set({ capturedImage: uri }),
  setCapturedVideo: (uri) => set({ capturedVideo: uri }),
}));
