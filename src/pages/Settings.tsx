import React, { useState, useEffect } from 'react';
import { useThemeStore, TransparencyMethod, TauriEffectType, VibrancyEffectType } from '../stores/useThemeStore';
import { Eye, Palette, RotateCcw, Sparkles, Settings as SettingsIcon, Code, Cpu, Layers, Info } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetToDefault } = useThemeStore();
  
  // 防禦性編程：確保設置對象結構完整
  const safeSettings = {
    ...settings,
    css: settings.css || {
      backdropFilter: true,
      borderRadius: 12,
      borderOpacity: 0.2,
      gradientOverlay: true,
    },
    tauriBuiltin: settings.tauriBuiltin || {
      effectType: 'mica' as TauriEffectType,
      effectState: 'active' as const,
      radius: 15,
      color: undefined,
    },
    windowVibrancy: settings.windowVibrancy || {
      effectType: 'appearanceBased' as VibrancyEffectType,
      blendingMode: 'behindWindow' as const,
      state: 'active' as const,
    },
  };
  const [isApplying, setIsApplying] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  // 透明度設置處理
  const handleOpacityChange = (value: number) => {
    updateSettings({ opacity: value / 100 });
  };

  const handleBlurChange = (value: number) => {
    updateSettings({ blurIntensity: value });
  };

  const handleTransparencyToggle = () => {
    updateSettings({ isTransparent: !settings.isTransparent });
  };

  // 透明效果方案切換
  const handleMethodChange = (method: TransparencyMethod) => {
    updateSettings({ transparencyMethod: method });
    // 立即應用 CSS 透明效果（如果選擇的是 CSS 方案）
    if (method === 'css') {
      setTimeout(() => {
        setLastResult('CSS 透明效果已應用 - 設置將立即生效');
      }, 100);
    }
  };

  // 監聽設置變更，自動應用 CSS 透明效果
  useEffect(() => {
    if (safeSettings.transparencyMethod === 'css' && safeSettings.isTransparent) {
      // 對於 CSS 方案，設置變更會自動通過 useTheme hook 應用
      const timeoutId = setTimeout(() => {
        setLastResult('CSS 透明效果設置已更新');
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    safeSettings.transparencyMethod,
    safeSettings.isTransparent,
    safeSettings.opacity,
    safeSettings.blurIntensity,
    safeSettings.saturation,
    safeSettings.css.backdropFilter,
    safeSettings.css.borderRadius,
    safeSettings.css.borderOpacity,
    safeSettings.css.gradientOverlay
  ]);

  // 應用透明效果
  const applyTransparencyEffect = async () => {
    setIsApplying(true);
    try {
      const config = {
        method: safeSettings.transparencyMethod,
        css: safeSettings.transparencyMethod === 'css' ? safeSettings.css : null,
        tauri_builtin: safeSettings.transparencyMethod === 'tauri-builtin' ? safeSettings.tauriBuiltin : null,
        window_vibrancy: safeSettings.transparencyMethod === 'window-vibrancy' ? safeSettings.windowVibrancy : null,
      };

      if (safeSettings.transparencyMethod === 'css') {
        // CSS 方案不需要調用後端，直接給用戶反饋
        setLastResult('CSS 透明效果已應用 - 設置通過前端 CSS 實時生效');
      } else {
        // 其他方案需要調用後端 API
        const result = await invoke('set_transparency_effect', { config });
        setLastResult(result as string);
      }
    } catch (error) {
      setLastResult(`錯誤: ${error}`);
      console.error('應用透明效果失敗:', error);
    }
    setIsApplying(false);
  };

  // 清除透明效果
  const clearTransparencyEffect = async () => {
    setIsApplying(true);
    try {
      if (safeSettings.transparencyMethod === 'css') {
        // CSS 方案：通過更新設置來清除效果
        updateSettings({ isTransparent: false });
        setLastResult('CSS 透明效果已關閉');
      } else {
        // 其他方案調用後端 API
        const result = await invoke('clear_transparency_effect', { 
          method: safeSettings.transparencyMethod 
        });
        setLastResult(result as string);
      }
    } catch (error) {
      setLastResult(`錯誤: ${error}`);
      console.error('清除透明效果失敗:', error);
    }
    setIsApplying(false);
  };

  // 透明效果方案列表（簡化版本）
  const transparencyMethods = [
    {
      key: 'css' as TransparencyMethod,
      name: 'CSS 透明效果',
      description: '跨平台 CSS backdrop-filter 實現，在 Windows 11 和 Windows 10 上均支援',
      icon: <Code className="w-5 h-5" />,
      platforms: 'Windows 10/11, macOS, Linux',
      pros: ['跨平台兼容', '即時生效', '可自定義程度高'],
      cons: ['依賴瀏覽器支援'],
      recommended: true
    },
    {
      key: 'tauri-builtin' as TransparencyMethod,
      name: 'Tauri 標籤式窗口',
      description: 'Tauri 內建的 tabbed 標籤式窗口效果，提供原生的 Windows 標籤窗口體驗',
      icon: <Cpu className="w-5 h-5" />,
      platforms: 'Windows 10/11',
      pros: ['原生標籤式效果', 'API 官方支援', '性能優化'],
      cons: ['僅支援 Windows']
    },
    {
      key: 'window-vibrancy' as TransparencyMethod,
      name: 'Window Vibrancy',
      description: '原生平台透明效果，提供最豐富的透明選項',
      icon: <Layers className="w-5 h-5" />,
      platforms: 'Windows, macOS, Linux',
      pros: ['原生效果最佳', '效果選項豐富', '跨平台支援'],
      cons: ['依賴第三方庫']
    }
  ];

  // Tauri 內建效果類型（專注於標籤式窗口）
  const tauriEffectTypes: { key: TauriEffectType; name: string; description: string; recommended?: boolean }[] = [
    { key: 'tabbed', name: 'Tabbed（推薦）', description: '標籤式窗口效果', recommended: true },
    { key: 'tabbedDark', name: 'Tabbed Dark', description: '深色標籤式窗口' },
    { key: 'tabbedLight', name: 'Tabbed Light', description: '淺色標籤式窗口' },
    { key: 'mica', name: 'Mica', description: 'Windows 11 桌面融合效果' },
    { key: 'acrylic', name: 'Acrylic', description: 'Windows 11 毛玻璃效果' },
    { key: 'blur', name: 'Blur', description: '基本模糊效果' },
  ];

  // Window Vibrancy 效果類型（簡化版本）
  const vibrancyEffectTypes: { key: VibrancyEffectType; name: string; platform: string }[] = [
    { key: 'appearanceBased', name: 'Appearance Based', platform: 'macOS' },
    { key: 'light', name: 'Light', platform: 'macOS' },
    { key: 'dark', name: 'Dark', platform: 'macOS' },
    { key: 'titlebar', name: 'Titlebar', platform: 'macOS' },
    { key: 'windowBackground', name: 'Window Background', platform: 'macOS' },
    { key: 'sidebar', name: 'Sidebar', platform: 'macOS' },
  ];

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 標題 */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">透明效果設置</h1>
          <p className="text-gray-400">選擇和配置不同的窗口透明效果方案</p>
        </div>

        {/* 方案選擇 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">透明效果方案</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {transparencyMethods.map((method) => (
              <div
                key={method.key}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  safeSettings.transparencyMethod === method.key
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
                onClick={() => handleMethodChange(method.key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-400">{method.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">{method.name}</h3>
                      <p className="text-xs text-gray-500">{method.platforms}</p>
                    </div>
                  </div>
                  {method.recommended && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">推薦</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3">{method.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-400">優點：</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {method.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-400">缺點：</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {method.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 應用和清除按鈕 */}
          <div className="flex space-x-4">
            <button
              onClick={applyTransparencyEffect}
              disabled={isApplying}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white transition-colors"
            >
              {isApplying ? '應用中...' : 
                safeSettings.transparencyMethod === 'css' ? '應用 CSS 透明效果' : '應用透明效果'
              }
            </button>
            <button
              onClick={clearTransparencyEffect}
              disabled={isApplying}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white transition-colors"
            >
              {safeSettings.transparencyMethod === 'css' ? '關閉透明效果' : '清除效果'}
            </button>
          </div>

          {/* 結果顯示 */}
          {lastResult && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{lastResult}</p>
              </div>
            </div>
          )}
        </div>

        {/* CSS 方案配置 */}
        {safeSettings.transparencyMethod === 'css' && (
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">CSS 透明效果配置</h2>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">實時生效</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Backdrop Filter</label>
                  <button
                    onClick={() => updateSettings({ 
                      css: { ...safeSettings.css, backdropFilter: !safeSettings.css.backdropFilter }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      safeSettings.css.backdropFilter ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        safeSettings.css.backdropFilter ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>邊框圓角</span>
                    <span>{safeSettings.css.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={safeSettings.css.borderRadius}
                    onChange={(e) => updateSettings({ 
                      css: { ...safeSettings.css, borderRadius: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>邊框透明度</span>
                    <span>{Math.round(safeSettings.css.borderOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={safeSettings.css.borderOpacity * 100}
                    onChange={(e) => updateSettings({ 
                      css: { ...safeSettings.css, borderOpacity: Number(e.target.value) / 100 }
                    })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">漸層覆蓋</label>
                  <button
                    onClick={() => updateSettings({ 
                      css: { ...safeSettings.css, gradientOverlay: !safeSettings.css.gradientOverlay }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      safeSettings.css.gradientOverlay ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        safeSettings.css.gradientOverlay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tauri 內建方案配置 */}
        {safeSettings.transparencyMethod === 'tauri-builtin' && (
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Tauri 內建效果配置</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">效果類型</label>
                <select
                  value={safeSettings.tauriBuiltin.effectType}
                  onChange={(e) => updateSettings({
                    tauriBuiltin: { ...safeSettings.tauriBuiltin, effectType: e.target.value as TauriEffectType }
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {tauriEffectTypes.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.name}{type.recommended ? ' ⭐' : ''} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">效果狀態</label>
                <select
                  value={safeSettings.tauriBuiltin.effectState}
                  onChange={(e) => updateSettings({
                    tauriBuiltin: { ...safeSettings.tauriBuiltin, effectState: e.target.value as any }
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="active">Active - 始終啟用</option>
                  <option value="inactive">Inactive - 始終停用</option>
                  <option value="followsWindowActiveState">Follow Window - 跟隨窗口狀態</option>
                </select>
              </div>

              {safeSettings.tauriBuiltin.effectType !== 'mica' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>模糊半徑</span>
                    <span>{safeSettings.tauriBuiltin.radius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={safeSettings.tauriBuiltin.radius || 0}
                    onChange={(e) => updateSettings({
                      tauriBuiltin: { ...safeSettings.tauriBuiltin, radius: Number(e.target.value) }
                    })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Window Vibrancy 方案配置 */}
        {safeSettings.transparencyMethod === 'window-vibrancy' && (
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Window Vibrancy 配置</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">效果類型</label>
                <select
                  value={safeSettings.windowVibrancy.effectType}
                  onChange={(e) => updateSettings({
                    windowVibrancy: { ...safeSettings.windowVibrancy, effectType: e.target.value as VibrancyEffectType }
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {vibrancyEffectTypes.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.name} ({type.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">混合模式</label>
                <select
                  value={safeSettings.windowVibrancy.blendingMode}
                  onChange={(e) => updateSettings({
                    windowVibrancy: { ...safeSettings.windowVibrancy, blendingMode: e.target.value as any }
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="behindWindow">Behind Window - 窗口後方</option>
                  <option value="withinWindow">Within Window - 窗口內部</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">狀態</label>
                <select
                  value={safeSettings.windowVibrancy.state}
                  onChange={(e) => updateSettings({
                    windowVibrancy: { ...safeSettings.windowVibrancy, state: e.target.value as any }
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="active">Active - 始終啟用</option>
                  <option value="inactive">Inactive - 始終停用</option>
                  <option value="followsWindowActiveState">Follow Window - 跟隨窗口</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 基本透明設置 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">基本透明設置</h2>
            {safeSettings.transparencyMethod === 'css' && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">實時生效</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-300">啟用透明效果</label>
                  <p className="text-xs text-gray-500">關閉後將顯示不透明背景</p>
                </div>
                <button
                  onClick={handleTransparencyToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    safeSettings.isTransparent ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      safeSettings.isTransparent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>背景透明度</span>
                  <span>{Math.round(safeSettings.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={safeSettings.opacity * 100}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  disabled={!safeSettings.isTransparent}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>模糊強度</span>
                  <span>{safeSettings.blurIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={safeSettings.blurIntensity}
                  onChange={(e) => handleBlurChange(Number(e.target.value))}
                  disabled={!safeSettings.isTransparent}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>飽和度</span>
                  <span>{safeSettings.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={safeSettings.saturation}
                  onChange={(e) => updateSettings({ saturation: Number(e.target.value) })}
                  disabled={!safeSettings.isTransparent}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">色彩方案</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'auto'] as const).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => updateSettings({ colorScheme: scheme })}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      safeSettings.colorScheme === scheme
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

            <div>
              <label className="block text-sm text-gray-300 mb-2">主色調</label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#3b82f6', '#8b5cf6', '#10b981', 
                  '#f59e0b', '#ef4444', '#06b6d4'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      safeSettings.accentColor === color
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

        {/* 重置設置 */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">一般設置</h2>
          </div>

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

        {/* 版本信息 */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-600/50">
          <p>Serphic v0.1.0 - 透明效果增強版</p>
          <p>支援 CSS、Tauri 內建、Window Vibrancy 三種透明方案</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 