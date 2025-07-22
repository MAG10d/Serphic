# 🚀 Serphic

一個現代化的跨平台數據庫管理工具，具有美觀的透明效果和直觀的用戶界面。

## ✨ 主要功能

### 🎨 透明效果系統
- **CSS 透明效果** - 跨平台兼容，支援 Windows 10/11、macOS、Linux
- **Tauri 標籤式窗口** - Windows 原生標籤窗口體驗
- **Window Vibrancy** - 豐富的原生透明效果選項

### 🗄️ 數據庫支援
- **MySQL** - 完整的連接和查詢支援
- **PostgreSQL** - 現代化的 SQL 數據庫
- **SQLite** - 輕量級本地數據庫

### 🛠️ 開發者工具
- 直觀的 SQL 查詢編輯器
- 數據庫結構瀏覽器
- 連接管理系統
- 可自定義的主題設置

## 🏗️ 技術架構

- **前端**: React + TypeScript + Tailwind CSS
- **後端**: Rust + Tauri 2.0
- **數據庫**: SQLx (支援多種數據庫)
- **狀態管理**: Zustand
- **透明效果**: CSS backdrop-filter + 原生 API

## 📥 下載安裝

### 發布版本
前往 [Releases](https://github.com/your-username/Serphic/releases) 頁面下載最新版本：

- **Windows**: `.msi` 或 `.exe` 安裝包
- **macOS**: `.app.tar.gz` 檔案
- **Linux**: `.AppImage` 或 `.deb` 包

### 系統需求
- **Windows**: Windows 10 1903+ 或 Windows 11
- **macOS**: macOS 10.15+
- **Linux**: Ubuntu 18.04+ 或同等版本

## 🛠️ 開發環境設置

### 必要條件
- [Node.js](https://nodejs.org/) (LTS 版本)
- [Rust](https://rustup.rs/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### 安裝依賴
```bash
# 安裝前端依賴
npm install

# 開發模式運行
npm run dev

# 構建生產版本
npm run build
```

### 推薦 IDE 設置
- [VS Code](https://code.visualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 🚀 CI/CD 和發布

### GitHub Actions Workflows

本項目包含兩個主要的 workflow：

#### 1. 持續集成 (CI)
觸發條件：
- 推送到 `main` 或 `develop` 分支
- Pull Request 到 `main` 分支

執行內容：
- TypeScript 類型檢查
- Rust 代碼檢查和測試
- 跨平台構建測試

#### 2. 自動發布 (Release)
觸發條件：
- 推送 `v*` 標籤 (例如 `v1.0.0`)
- 手動觸發

執行內容：
- 構建 Windows、macOS、Linux 版本
- 自動創建 GitHub Release
- 上傳所有平台的安裝包

### 發布新版本

1. **更新版本號**：
   ```bash
   # 更新 src-tauri/Cargo.toml 中的版本
   # 更新 src-tauri/tauri.conf.json 中的版本
   # 更新 package.json 中的版本
   ```

2. **創建並推送標籤**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **自動發布**：
   - GitHub Actions 將自動構建所有平台
   - 創建 Release 並上傳安裝包
   - 發布包含更新日誌的 Release 說明

### 手動發布
也可以在 GitHub Actions 頁面手動觸發發布 workflow。

## 🎨 透明效果使用指南

### CSS 透明效果（推薦）
- ✅ 跨平台兼容
- ✅ 實時調整
- ✅ 穩定性佳
- 適用於所有作業系統

### Tauri 標籤式窗口
- ✅ Windows 原生體驗
- ✅ 官方 API 支援
- ⚠️ 僅限 Windows 平台

### Window Vibrancy
- ✅ 原生效果最佳
- ✅ 效果選項豐富
- ⚠️ 依賴第三方庫

## 🤝 貢獻指南

1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 License

本項目採用 MIT License - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🐛 問題回報

如發現 bug 或有功能建議，請在 [Issues](https://github.com/your-username/Serphic/issues) 中提出。

## 🙏 致謝

- [Tauri](https://tauri.app/) - 跨平台應用框架
- [React](https://reactjs.org/) - UI 庫
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [SQLx](https://github.com/launchbadge/sqlx) - Rust SQL 工具包
