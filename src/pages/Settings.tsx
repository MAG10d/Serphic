import React from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { Monitor, Eye, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetToDefault } = useThemeStore();

  const handleOpacityChange = (value: number) => {
    updateSettings({ opacity: value / 100 });
  };

  const handleBlurChange = (value: number) => {
    updateSettings({ blurIntensity: value });
  };

  const handleTransparencyToggle = () => {
    updateSettings({ isTransparent: !settings.isTransparent });
  };

  const handleEffectTypeChange = async (effectType: 'css' | 'acrylic' | 'mica' | 'mica-alt') => {
    try {
      const result = await invoke('set_window_effect', { 
        effectType 
      });
      
      updateSettings({ effectType });
      console.log(result);
    } catch (error) {
      console.error('切換透明效果失敗:', error);
    }
  };

  const handleColorSchemeChange = (scheme: 'dark' | 'light' | 'auto') => {
    updateSettings({ colorScheme: scheme });
  };

  const handleAccentColorChange = (color: string) => {
    updateSettings({ accentColor: color });
  };

  const effectTypes = [
    { 
      key: 'css' as const, 
      label: 'CSS 模糊', 
      desc: '跨平台兼容',
      icon: '🌐',
      platforms: 'Windows / macOS / Linux'
    },
    { 
      key: 'acrylic' as const, 
      label: 'Acrylic', 
      desc: 'Windows 11 毛玻璃',
      icon: '💎',
      platforms: 'Windows 11+'
    },
    { 
      key: 'mica' as const, 
      label: 'Mica', 
      desc: 'Windows 11 桌面融合',
      icon: '✨',
      platforms: 'Windows 11+'
    },
    { 
      key: 'mica-alt' as const, 
      label: 'Mica Alt', 
      desc: 'Windows 11 標籤窗口',
      icon: '🔮',
      platforms: 'Windows 11+'
    }
  ];

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 標題 */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">設置</h1>
          <p className="text-gray-400">自定義 Serphic 的外觀和行為</p>
        </div>

        {/* 透明度設置 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">透明效果</h2>
          </div>

          <div className="space-y-6">
            {/* 透明效果類型 */}
            <div>
              <label className="block text-sm text-gray-300 mb-3">透明效果類型</label>
              <div className="grid grid-cols-1 gap-3">
                {effectTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => handleEffectTypeChange(type.key)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                      settings.effectType === type.key
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.desc}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{type.platforms}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 啟用透明 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-300">啟用透明效果</label>
                <p className="text-xs text-gray-500">關閉後將顯示不透明背景</p>
              </div>
              <button
                onClick={handleTransparencyToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.isTransparent ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isTransparent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 透明度滑桿 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>背景透明度</span>
                <span>{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={settings.opacity * 100}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                disabled={!settings.isTransparent}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* 模糊強度 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>模糊強度</span>
                <span>{settings.blurIntensity}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.blurIntensity}
                onChange={(e) => handleBlurChange(Number(e.target.value))}
                disabled={!settings.isTransparent}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* 飽和度 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>飽和度</span>
                <span>{settings.saturation}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                value={settings.saturation}
                onChange={(e) => updateSettings({ saturation: Number(e.target.value) })}
                disabled={!settings.isTransparent}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* 亮度 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>亮度</span>
                <span>{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.brightness}
                onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
                disabled={!settings.isTransparent}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* 效果說明 */}
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600/50">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">當前效果: {effectTypes.find(t => t.key === settings.effectType)?.label}</p>
                  <p>{effectTypes.find(t => t.key === settings.effectType)?.desc}</p>
                  {settings.effectType !== 'css' && (
                    <p className="mt-1 text-yellow-400">
                      原生效果需要 {effectTypes.find(t => t.key === settings.effectType)?.platforms} 支援
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主題設置 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">主題設置</h2>
          </div>

          <div className="space-y-4">
            {/* 色彩方案 */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">色彩方案</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'auto'] as const).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => handleColorSchemeChange(scheme)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      settings.colorScheme === scheme
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {scheme === 'dark' && '深色'}
                    {scheme === 'light' && '淺色'}
                    {scheme === 'auto' && '自動'}
                  </button>
                ))}
              </div>
            </div>

            {/* 主色調 */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">主色調</label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#3b82f6', // 藍色
                  '#8b5cf6', // 紫色
                  '#10b981', // 綠色
                  '#f59e0b', // 橙色
                  '#ef4444', // 紅色
                  '#06b6d4'  // 青色
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleAccentColorChange(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      settings.accentColor === color
                        ? 'border-white shadow-lg scale-110'
                        : 'border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 其他設置 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">一般設置</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-300">重置為預設值</label>
                <p className="text-xs text-gray-500">將所有設置重置為初始狀態</p>
              </div>
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-600/50">
          <p>Serphic v0.1.0</p>
          <p>輕量級資料庫管理工具</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 