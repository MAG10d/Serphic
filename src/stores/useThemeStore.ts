import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 透明效果實現方案類型
export type TransparencyMethod = 'css' | 'tauri-builtin' | 'window-vibrancy';

// Tauri 內建效果類型
export type TauriEffectType = 'mica' | 'acrylic' | 'blur' | 'tabbed' | 'tabbedDark' | 'tabbedLight';

// window-vibrancy 效果類型
export type VibrancyEffectType = 'appearanceBased' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'headerView' | 'sheet' | 'windowBackground' | 'hudWindow' | 'fullScreenUI' | 'tooltip' | 'contentBackground' | 'underWindowBackground' | 'underPageBackground';

export interface ThemeSettings {
  // 基本透明設置
  isTransparent: boolean;
  opacity: number;
  blurIntensity: number;
  saturation: number;
  brightness: number;
  
  // 主題設置
  colorScheme: 'dark' | 'light' | 'auto';
  accentColor: string;
  
  // 透明效果實現方案
  transparencyMethod: TransparencyMethod;
  
  // CSS 方案設置
  css: {
    backdropFilter: boolean;
    borderRadius: number;
    borderOpacity: number;
    gradientOverlay: boolean;
  };
  
  // Tauri 內建方案設置
  tauriBuiltin: {
    effectType: TauriEffectType;
    effectState: 'active' | 'inactive' | 'followsWindowActiveState';
    radius?: number;
    color?: string;
  };
  
  // window-vibrancy 方案設置
  windowVibrancy: {
    effectType: VibrancyEffectType;
    blendingMode: 'withinWindow' | 'behindWindow';
    state: 'active' | 'inactive' | 'followsWindowActiveState';
  };
}

interface ThemeStore {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefault: () => void;
}

const defaultSettings: ThemeSettings = {
  // 基本透明設置
  isTransparent: true,
  opacity: 0.85,
  blurIntensity: 20,
  saturation: 150,
  brightness: 100,
  
  // 主題設置
  colorScheme: 'dark',
  accentColor: '#3b82f6',
  
  // 透明效果實現方案
  transparencyMethod: 'css',
  
  // CSS 方案設置
  css: {
    backdropFilter: true,
    borderRadius: 12,
    borderOpacity: 0.2,
    gradientOverlay: true,
  },
  
  // Tauri 內建方案設置
  tauriBuiltin: {
    effectType: 'mica',
    effectState: 'active',
    radius: 15,
    color: undefined,
  },
  
  // window-vibrancy 方案設置
  windowVibrancy: {
    effectType: 'appearanceBased',
    blendingMode: 'behindWindow',
    state: 'active',
  },
};

// 修復設置數據結構的輔助函數
const fixSettingsStructure = (settings: any): ThemeSettings => {
  return {
    // 基本透明設置
    isTransparent: settings?.isTransparent ?? defaultSettings.isTransparent,
    opacity: settings?.opacity ?? defaultSettings.opacity,
    blurIntensity: settings?.blurIntensity ?? defaultSettings.blurIntensity,
    saturation: settings?.saturation ?? defaultSettings.saturation,
    brightness: settings?.brightness ?? defaultSettings.brightness,
    
    // 主題設置
    colorScheme: settings?.colorScheme ?? defaultSettings.colorScheme,
    accentColor: settings?.accentColor ?? defaultSettings.accentColor,
    
    // 透明效果實現方案
    transparencyMethod: settings?.transparencyMethod ?? defaultSettings.transparencyMethod,
    
    // CSS 方案設置
    css: {
      ...defaultSettings.css,
      ...settings?.css
    },
    
    // Tauri 內建方案設置
    tauriBuiltin: {
      ...defaultSettings.tauriBuiltin,
      ...settings?.tauriBuiltin
    },
    
    // window-vibrancy 方案設置
    windowVibrancy: {
      ...defaultSettings.windowVibrancy,
      ...settings?.windowVibrancy
    },
  };
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
      name: 'serphic-theme-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 修復舊數據結構
          state.settings = fixSettingsStructure(state.settings);
        }
      }
    }
  )
); 