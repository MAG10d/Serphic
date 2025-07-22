import { useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { invoke } from '@tauri-apps/api/core';

export const useTheme = () => {
  const { settings } = useThemeStore();

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // 清除舊的效果類別
    root.classList.remove('effect-acrylic', 'effect-mica', 'effect-mica-alt');

    // 應用透明度設置
    if (settings.isTransparent) {
      // 根據效果類型添加對應的 CSS 類別
      switch (settings.effectType) {
        case 'acrylic':
          root.classList.add('effect-acrylic');
          break;
        case 'mica':
          root.classList.add('effect-mica');
          break;
        case 'mica-alt':
          root.classList.add('effect-mica-alt');
          break;
        case 'css':
        default:
          // 使用基本的內聯樣式進行微調
          root.style.background = `rgba(13, 13, 13, ${settings.opacity})`;
          root.style.backdropFilter = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(${settings.brightness}%)`;
          root.style.webkitBackdropFilter = `blur(${settings.blurIntensity}px) saturate(${settings.saturation}%) brightness(${settings.brightness}%)`;
          break;
      }
    } else {
      // 不透明背景
      root.style.background = 'rgb(13, 13, 13)';
      root.style.backdropFilter = 'none';
      root.style.webkitBackdropFilter = 'none';
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

  // 初始化時通知後端效果類型已改變
  useEffect(() => {
    const notifyEffectChange = async () => {
      try {
        const result = await invoke('set_window_effect', { 
          effectType: settings.effectType 
        });
        console.log(result);
      } catch (error) {
        console.error('通知透明效果變更失敗:', error);
      }
    };

    notifyEffectChange();
  }, [settings.effectType]);

  return settings;
}; 