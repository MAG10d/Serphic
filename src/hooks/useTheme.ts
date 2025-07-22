import { useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { invoke } from '@tauri-apps/api/core';

export const useTheme = () => {
  const { settings } = useThemeStore();

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // 清除舊的效果類別
    root.classList.remove('effect-acrylic', 'effect-mica', 'effect-tabbed');

    // 應用透明度設置
    if (settings.isTransparent) {
      // 根據透明效果方案類型應用相應的樣式
      switch (settings.transparencyMethod) {
        case 'css':
          // CSS 方案：增強 Windows 11 兼容性
          const cssOpacity = Math.max(0.3, settings.opacity); // 確保最小可見性
          
          // 使用漸變背景確保在所有情況下都有視覺效果
          root.style.background = `linear-gradient(135deg, rgba(13, 13, 13, ${cssOpacity}) 0%, rgba(20, 20, 20, ${cssOpacity * 0.95}) 100%)`;
          
          if (settings.css.backdropFilter) {
            // 增強的 backdrop-filter，包含所有瀏覽器前綴
            const filterValue = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(${settings.brightness}%)`;
            root.style.backdropFilter = filterValue;
            (root.style as any)['webkitBackdropFilter'] = filterValue;
            (root.style as any)['mozBackdropFilter'] = filterValue;
            (root.style as any)['msBackdropFilter'] = filterValue;
            
            // Windows 11 特殊處理：添加對比度增強
            if (navigator.userAgent.includes('Windows NT 10.0')) {
              const enhancedFilter = `${filterValue} contrast(105%)`;
              root.style.backdropFilter = enhancedFilter;
                             (root.style as any)['webkitBackdropFilter'] = enhancedFilter;
            }
          } else {
            root.style.backdropFilter = 'none';
            (root.style as any)['webkitBackdropFilter'] = 'none';
            (root.style as any)['mozBackdropFilter'] = 'none';
            (root.style as any)['msBackdropFilter'] = 'none';
          }
          
          // 應用邊框圓角
          root.style.borderRadius = `${settings.css.borderRadius}px`;
          
          // Windows 11 優化：確保透明度層疊正確
          root.style.isolation = 'isolate';
          break;
          
        case 'tauri-builtin':
          // Tauri 內建方案：特別處理 tabbed 效果
          switch (settings.tauriBuiltin.effectType) {
            case 'tabbed':
            case 'tabbedDark':
            case 'tabbedLight':
              // 標籤式窗口效果
              root.classList.add('effect-tabbed');
              break;
            case 'acrylic':
              root.classList.add('effect-acrylic');
              break;
            case 'mica':
              root.classList.add('effect-mica');
              break;
            default:
              // 使用基本透明效果，增強 Windows 11 兼容性
              const tauriOpacity = Math.max(0.3, settings.opacity);
              root.style.background = `linear-gradient(135deg, rgba(13, 13, 13, ${tauriOpacity}) 0%, rgba(20, 20, 20, ${tauriOpacity * 0.95}) 100%)`;
              
              const basicFilter = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(105%)`;
              root.style.backdropFilter = basicFilter;
                             (root.style as any)['webkitBackdropFilter'] = basicFilter;
               (root.style as any)['mozBackdropFilter'] = basicFilter;
          }
          break;
          
        case 'window-vibrancy':
          // window-vibrancy 方案：使用基本透明效果作為前端顯示
          const vibrancyOpacity = Math.max(0.3, settings.opacity);
          root.style.background = `linear-gradient(135deg, rgba(13, 13, 13, ${vibrancyOpacity}) 0%, rgba(20, 20, 20, ${vibrancyOpacity * 0.95}) 100%)`;
          
          const vibrancyFilter = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(105%)`;
          root.style.backdropFilter = vibrancyFilter;
                     (root.style as any)['webkitBackdropFilter'] = vibrancyFilter;
           (root.style as any)['mozBackdropFilter'] = vibrancyFilter;
          break;
          
        default:
          // 預設透明效果，Windows 11 優化版本
          const defaultOpacity = Math.max(0.3, settings.opacity);
          root.style.background = `linear-gradient(135deg, rgba(13, 13, 13, ${defaultOpacity}) 0%, rgba(20, 20, 20, ${defaultOpacity * 0.95}) 100%)`;
          
          const defaultFilter = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(${settings.brightness}%)`;
          root.style.backdropFilter = defaultFilter;
                     (root.style as any)['webkitBackdropFilter'] = defaultFilter;
           (root.style as any)['mozBackdropFilter'] = defaultFilter;
          break;
      }
    } else {
      // 不透明背景
      root.style.background = 'linear-gradient(135deg, rgb(13, 13, 13) 0%, rgb(20, 20, 20) 100%)';
      root.style.backdropFilter = 'none';
             (root.style as any)['webkitBackdropFilter'] = 'none';
       (root.style as any)['mozBackdropFilter'] = 'none';
       (root.style as any)['msBackdropFilter'] = 'none';
      root.style.borderRadius = '0px';
      root.style.isolation = 'auto';
    }

    // 應用主色調
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);

    // 應用色彩方案
    if (settings.colorScheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', settings.colorScheme === 'dark');
    }
  }, [settings]);

  // 當透明效果方案或設置改變時，通知後端
  useEffect(() => {
    const notifyEffectChange = async () => {
      try {
        // 只在非 CSS 方案時調用後端 API
        if (settings.transparencyMethod !== 'css') {
          const result = await invoke('set_transparency_effect', { 
            config: {
              method: settings.transparencyMethod,
              css: null,
              tauri_builtin: settings.transparencyMethod === 'tauri-builtin' ? settings.tauriBuiltin : null,
              window_vibrancy: settings.transparencyMethod === 'window-vibrancy' ? settings.windowVibrancy : null,
            }
          });
          console.log('透明效果應用結果:', result);
        } else {
          // CSS 方案，記錄到控制台
          console.log('CSS 透明效果已應用，Windows 11 兼容模式:', {
            opacity: settings.opacity,
            blurIntensity: settings.blurIntensity,
            saturation: settings.saturation,
            backdropFilter: settings.css.backdropFilter
          });
        }
      } catch (error) {
        console.error('透明效果應用失敗:', error);
      }
    };

    if (settings.isTransparent) {
      notifyEffectChange();
    }
  }, [settings.transparencyMethod, settings.isTransparent, settings.tauriBuiltin, settings.windowVibrancy]);

  return settings;
}; 