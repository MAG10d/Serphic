import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeSettings {
  isTransparent: boolean;
  opacity: number;
  blurIntensity: number;
  colorScheme: 'dark' | 'light' | 'auto';
  accentColor: string;
  effectType: 'css' | 'acrylic' | 'mica' | 'mica-alt';
  saturation: number;
  brightness: number;
}

interface ThemeStore {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefault: () => void;
}

const defaultSettings: ThemeSettings = {
  isTransparent: true,
  opacity: 0.85,
  blurIntensity: 20,
  colorScheme: 'dark',
  accentColor: '#3b82f6',
  effectType: 'css',
  saturation: 150,
  brightness: 100
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      resetToDefault: () =>
        set({ settings: { ...defaultSettings } })
    }),
    {
      name: 'serphic-theme-settings'
    }
  )
); 