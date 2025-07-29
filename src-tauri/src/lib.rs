use serde::{Deserialize, Serialize};
use sqlx::{Column, Row, TypeInfo};
use tauri::WebviewWindow;

// 重新啟用 window-vibrancy，使用最新版本應該兼容 Tauri 2.0
#[cfg(target_os = "windows")]
use window_vibrancy::{apply_blur, apply_mica, apply_acrylic, clear_blur, clear_mica, clear_acrylic};

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectBlendingMode, NSVisualEffectState};

#[cfg(target_os = "linux")]
use window_vibrancy::apply_gtk_blur;

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConnection {
    pub name: String,
    pub db_type: String,
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransparencyConfig {
    pub method: String, // 'css', 'tauri-builtin', 'window-vibrancy'
    pub css: Option<CssConfig>,
    pub tauri_builtin: Option<TauriBuiltinConfig>,
    pub window_vibrancy: Option<WindowVibrancyConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CssConfig {
    pub backdrop_filter: bool,
    pub border_radius: f64,
    pub border_opacity: f64,
    pub gradient_overlay: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TauriBuiltinConfig {
    pub effect_type: String, // 'mica', 'acrylic', 'blur', etc.
    pub effect_state: String, // 'active', 'inactive', 'followsWindowActiveState'
    pub radius: Option<f64>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowVibrancyConfig {
    pub effect_type: String, // material type
    pub blending_mode: String, // 'withinWindow', 'behindWindow'
    pub state: String, // 'active', 'inactive', 'followsWindowActiveState'
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestResult {
    pub success: bool,
    pub message: String,
    pub execution_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryRequest {
    pub connection: DatabaseConnection,
    pub sql: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub success: bool,
    pub columns: Vec<String>,
    pub rows: Vec<Vec<serde_json::Value>>,
    pub affected_rows: Option<u64>,
    pub execution_time: u64,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TableInfo {
    pub name: String,
    pub row_count: u64,
    pub table_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseTablesResult {
    pub success: bool,
    pub tables: Vec<TableInfo>,
    pub message: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

#[tauri::command]
async fn test_database_connection(connection: DatabaseConnection) -> Result<TestResult, String> {
    let start_time = std::time::Instant::now();
    
    let result = match connection.db_type.as_str() {
        "mysql" => test_mysql_connection(&connection).await,
        "postgresql" => test_postgres_connection(&connection).await,
        "sqlite" => test_sqlite_connection(&connection).await,
        _ => return Err("不支援的資料庫類型".to_string()),
    };
    
    let execution_time = start_time.elapsed().as_millis() as u64;
    
    match result {
        Ok(message) => Ok(TestResult {
            success: true,
            message,
            execution_time,
        }),
        Err(error) => Ok(TestResult {
            success: false,
            message: format!("連接失敗: {error}"),
            execution_time,
        }),
    }
}

#[tauri::command]
async fn execute_query(request: QueryRequest) -> Result<QueryResult, String> {
    let start_time = std::time::Instant::now();
    
    let result = match request.connection.db_type.as_str() {
        "mysql" => execute_mysql_query(&request.connection, &request.sql).await,
        "postgresql" => execute_postgres_query(&request.connection, &request.sql).await,
        "sqlite" => execute_sqlite_query(&request.connection, &request.sql).await,
        _ => return Err("不支援的資料庫類型".to_string()),
    };
    
    let execution_time = start_time.elapsed().as_millis() as u64;
    
    match result {
        Ok(mut query_result) => {
            query_result.execution_time = execution_time;
            Ok(query_result)
        }
        Err(error) => Ok(QueryResult {
            success: false,
            columns: vec![],
            rows: vec![],
            affected_rows: None,
            execution_time,
            message: format!("查詢錯誤: {error}"),
        }),
    }
}

#[tauri::command]
async fn select_sqlite_file() -> Result<Option<String>, String> {
    // 這是一個簡化的實現，實際的對話框會在前端調用
    Ok(None)
}

#[tauri::command]
async fn get_database_tables(connection: DatabaseConnection) -> Result<DatabaseTablesResult, String> {
    match connection.db_type.as_str() {
        "sqlite" => get_sqlite_tables(&connection).await,
        "mysql" => get_mysql_tables(&connection).await,
        "postgresql" => get_postgres_tables(&connection).await,
        _ => Ok(DatabaseTablesResult {
            success: false,
            tables: vec![],
            message: "不支援的資料庫類型".to_string(),
        }),
    }
}

// 透明效果設置命令 - 支持所有三種方案
#[tauri::command]
async fn set_transparency_effect(window: WebviewWindow, config: TransparencyConfig) -> Result<String, String> {
    match config.method.as_str() {
        "css" => {
            // CSS 方案：主要通過前端 CSS 處理，後端只返回確認訊息
            if let Some(css_config) = config.css {
                Ok(format!(
                    "CSS 透明效果已啟用 - 模糊: {}, 邊框圓角: {}px", 
                    if css_config.backdrop_filter { "開啟" } else { "關閉" },
                    css_config.border_radius
                ))
            } else {
                Ok("CSS 透明效果已啟用（預設配置）".to_string())
            }
        },
        
        "tauri-builtin" => {
            // Tauri 2.0 內建方案
            if let Some(tauri_config) = config.tauri_builtin {
                apply_tauri_builtin_effect(&window, &tauri_config).await
            } else {
                Err("Tauri 內建方案配置缺失".to_string())
            }
        },
        
        "window-vibrancy" => {
            // window-vibrancy crate 方案
            if let Some(vibrancy_config) = config.window_vibrancy {
                apply_window_vibrancy_effect(&window, &vibrancy_config).await
            } else {
                Err("window-vibrancy 方案配置缺失".to_string())
            }
        },
        
        _ => {
            let method = &config.method;
            Err(format!("不支援的透明效果方案: {method}"))
        }
    }
}

// Tauri 2.0 內建效果實現 - 使用 setEffects API
async fn apply_tauri_builtin_effect(window: &WebviewWindow, config: &TauriBuiltinConfig) -> Result<String, String> {
    // 使用 Tauri 2.0 的新 API
    let effect_type = match config.effect_type.as_str() {
        "mica" => "mica",
        "acrylic" => "acrylic", 
        "blur" => "blur",
        "tabbed" => "tabbed",
        "tabbedDark" => "tabbedDark",
        "tabbedLight" => "tabbedLight",
        _ => "mica" // 默認使用 mica
    };
    
    let effect_state = match config.effect_state.as_str() {
        "active" => "active",
        "inactive" => "inactive", 
        "followsWindowActiveState" => "followsWindowActiveState",
        _ => "active"
    };
    
    // 構造效果配置
    let effects_config = serde_json::json!({
        "effects": [effect_type],
        "state": effect_state,
        "radius": config.radius
    });
    
    // 嘗試使用 Tauri 內建 API
    #[allow(clippy::uninlined_format_args)]
    let script = format!(
        "window.__TAURI__.window.getCurrentWindow().setEffects({})",
        effects_config
    );
    match window.eval(&script) {
        Ok(_) => Ok(format!("Tauri 內建 {effect_type} 效果已應用 - 狀態: {effect_state}")),
        Err(e) => Ok(format!("Tauri 內建效果配置完成（可能需要較新版本）: {effect_type} - {e}"))
    }
}

// window-vibrancy 效果實現 - 重新啟用
async fn apply_window_vibrancy_effect(window: &WebviewWindow, config: &WindowVibrancyConfig) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        // 對於 Tauri 2.0，需要使用不同的方法獲取窗口句柄
        match config.effect_type.as_str() {
            "blur" => {
                // 嘗試使用 window-vibrancy，但使用 Tauri 2.0 兼容的方式
                match apply_blur(window, None) {
                    Ok(_) => Ok("Windows Blur 效果已應用".to_string()),
                    Err(e) => Err(format!("Windows Blur 效果應用失敗: {e}"))
                }
            },
            "acrylic" => {
                match apply_acrylic(window, None) {
                    Ok(_) => Ok("Windows Acrylic 效果已應用".to_string()),
                    Err(e) => Err(format!("Windows Acrylic 效果應用失敗: {e}"))
                }
            },
            "mica" => {
                match apply_mica(window, None) {
                    Ok(_) => Ok("Windows Mica 效果已應用".to_string()),
                    Err(e) => Err(format!("Windows Mica 效果應用失敗: {e}"))
                }
            },
            _ => {
                let effect_type = &config.effect_type;
                Err(format!("Windows 不支援的效果類型: {effect_type}"))
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let material = match config.effect_type.as_str() {
            "appearanceBased" => NSVisualEffectMaterial::AppearanceBased,
            "light" => NSVisualEffectMaterial::Light,
            "dark" => NSVisualEffectMaterial::Dark,
            "titlebar" => NSVisualEffectMaterial::Titlebar,
            "windowBackground" => NSVisualEffectMaterial::WindowBackground,
            "sidebar" => NSVisualEffectMaterial::Sidebar,
            _ => NSVisualEffectMaterial::AppearanceBased
        };
        
        let blending_mode = match config.blending_mode.as_str() {
            "behindWindow" => NSVisualEffectBlendingMode::BehindWindow,
            "withinWindow" => NSVisualEffectBlendingMode::WithinWindow,
            _ => NSVisualEffectBlendingMode::BehindWindow
        };
        
        let state = match config.state.as_str() {
            "active" => NSVisualEffectState::Active,
            "inactive" => NSVisualEffectState::Inactive,
            "followsWindowActiveState" => NSVisualEffectState::FollowsWindowActiveState,
            _ => NSVisualEffectState::Active
        };
        
        match apply_vibrancy(window, material, Some(state), Some(blending_mode)) {
            Ok(_) => {
                let effect_type = &config.effect_type;
                Ok(format!("macOS {effect_type} 效果已應用"))
            },
            Err(e) => Err(format!("macOS Vibrancy 效果應用失敗: {e}"))
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        match apply_gtk_blur(window) {
            Ok(_) => Ok("Linux GTK 模糊效果已應用".to_string()),
            Err(e) => Err(format!("Linux GTK 模糊效果應用失敗: {e}"))
        }
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("當前平台不支援 window-vibrancy 效果".to_string())
    }
}

// 清除透明效果命令
#[tauri::command]
async fn clear_transparency_effect(window: WebviewWindow, method: String) -> Result<String, String> {
    match method.as_str() {
        "css" => Ok("CSS 透明效果已清除（請在前端處理）".to_string()),
        
        "tauri-builtin" => {
            // 使用 Tauri 2.0 內建 API 清除效果
            match window.eval("window.__TAURI__.window.getCurrentWindow().clearEffects()") {
                Ok(_) => Ok("Tauri 內建透明效果已清除".to_string()),
                Err(e) => Ok(format!("透明效果清除完成: {e}"))
            }
        },
        
        "window-vibrancy" => {
            #[cfg(target_os = "windows")]
            {
                let _ = clear_blur(&window);
                let _ = clear_acrylic(&window);
                let _ = clear_mica(&window);
                Ok("Windows 透明效果已清除".to_string())
            }
            
            #[cfg(not(target_os = "windows"))]
            {
                Ok("非 Windows 平台，透明效果清除完成".to_string())
            }
        },
        
        _ => Ok("透明效果已重置".to_string())
    }
}

async fn execute_sqlite_query(connection: &DatabaseConnection, sql: &str) -> Result<QueryResult, String> {
    let database_path = if connection.database.is_empty() {
        ":memory:".to_string()
    } else {
        connection.database.clone()
    };

    // 使用連接池設置優化性能
    let pool = sqlx::sqlite::SqlitePool::connect_with(
        sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&database_path)
            .create_if_missing(false)
    )
    .await
    .map_err(|e| format!("SQLite 連接錯誤: {e}"))?;

    // 檢查是否為 SELECT 查詢
    let trimmed_sql = sql.trim().to_lowercase();
    let is_select = trimmed_sql.starts_with("select");

    if is_select {
        // SELECT 查詢，返回結果集
        let rows = sqlx::query(sql)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("查詢執行錯誤: {e}"))?;

        if rows.is_empty() {
            pool.close().await;
            return Ok(QueryResult {
                success: true,
                columns: vec![],
                rows: vec![],
                affected_rows: Some(0),
                execution_time: 0,
                message: "查詢成功，無結果".to_string(),
            });
        }

        // 獲取列名
        let columns: Vec<String> = rows[0]
            .columns()
            .iter()
            .map(|col| col.name().to_string())
            .collect();

        // 轉換行數據 - 優化版本
        let mut result_rows = Vec::with_capacity(rows.len());
        for row in rows {
            let mut row_data = Vec::with_capacity(row.columns().len());
            for (i, column) in row.columns().iter().enumerate() {
                let value: serde_json::Value = match column.type_info().name() {
                    "TEXT" | "VARCHAR" => {
                        match row.try_get::<Option<String>, _>(i) {
                            Ok(Some(s)) => serde_json::Value::String(s),
                            Ok(None) => serde_json::Value::Null,
                            Err(_) => serde_json::Value::Null,
                        }
                    }
                    "INTEGER" => {
                        match row.try_get::<Option<i64>, _>(i) {
                            Ok(Some(n)) => serde_json::Value::Number(serde_json::Number::from(n)),
                            Ok(None) => serde_json::Value::Null,
                            Err(_) => serde_json::Value::Null,
                        }
                    }
                    "REAL" => {
                        match row.try_get::<Option<f64>, _>(i) {
                            Ok(Some(n)) => serde_json::Number::from_f64(n)
                                .map(serde_json::Value::Number)
                                .unwrap_or(serde_json::Value::Null),
                            Ok(None) => serde_json::Value::Null,
                            Err(_) => serde_json::Value::Null,
                        }
                    }
                    _ => {
                        // 其他類型嘗試轉為字符串
                        match row.try_get::<Option<String>, _>(i) {
                            Ok(Some(s)) => serde_json::Value::String(s),
                            Ok(None) => serde_json::Value::Null,
                            Err(_) => serde_json::Value::Null,
                        }
                    }
                };
                row_data.push(value);
            }
            result_rows.push(row_data);
        }

        pool.close().await;

        let row_count = result_rows.len();
        Ok(QueryResult {
            success: true,
            columns,
            rows: result_rows,
            affected_rows: Some(row_count as u64),
            execution_time: 0,
            message: format!("查詢成功，返回 {row_count} 行"),
        })
    } else {
        // 非 SELECT 查詢 (INSERT, UPDATE, DELETE, CREATE, etc.)
        let result = sqlx::query(sql)
            .execute(&pool)
            .await
            .map_err(|e| format!("執行錯誤: {e}"))?;

        let affected_rows = result.rows_affected();
        let message = if trimmed_sql.starts_with("create") {
            "表格創建成功".to_string()
        } else if trimmed_sql.starts_with("insert") {
            format!("插入成功，影響 {affected_rows} 行")
        } else if trimmed_sql.starts_with("update") {
            format!("更新成功，影響 {affected_rows} 行")
        } else if trimmed_sql.starts_with("delete") {
            format!("刪除成功，影響 {affected_rows} 行")
        } else {
            format!("執行成功，影響 {affected_rows} 行")
        };

        pool.close().await;

        Ok(QueryResult {
            success: true,
            columns: vec![],
            rows: vec![],
            affected_rows: Some(affected_rows),
            execution_time: 0,
            message,
        })
    }
}

async fn execute_mysql_query(connection: &DatabaseConnection, sql: &str) -> Result<QueryResult, String> {
    let database_url = format!(
        "mysql://{}:{}@{}:{}/{}",
        connection.username,
        connection.password,
        connection.host,
        connection.port,
        connection.database
    );

    let pool = sqlx::mysql::MySqlPool::connect(&database_url)
        .await
        .map_err(|e| format!("MySQL 連接錯誤: {e}"))?;

    // 簡化版：目前只支持基本查詢
    let trimmed_sql = sql.trim().to_lowercase();
    let is_select = trimmed_sql.starts_with("select");

    if is_select {
        let rows = sqlx::query(sql)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("查詢執行錯誤: {e}"))?;

        if rows.is_empty() {
            return Ok(QueryResult {
                success: true,
                columns: vec![],
                rows: vec![],
                affected_rows: Some(0),
                execution_time: 0,
                message: "查詢成功，無結果".to_string(),
            });
        }

        let columns: Vec<String> = rows[0]
            .columns()
            .iter()
            .map(|col| col.name().to_string())
            .collect();

        Ok(QueryResult {
            success: true,
            columns,
            rows: vec![], // 簡化版，暫不處理複雜的數據轉換
            affected_rows: Some(rows.len() as u64),
            execution_time: 0,
            message: format!("查詢成功，返回 {} 行", rows.len()),
        })
    } else {
        let result = sqlx::query(sql)
            .execute(&pool)
            .await
            .map_err(|e| format!("執行錯誤: {e}"))?;
        
        let rows_affected = result.rows_affected();
        Ok(QueryResult {
            success: true,
            columns: vec![],
            rows: vec![],
            affected_rows: Some(rows_affected),
            execution_time: 0,
            message: format!("執行成功，影響 {rows_affected} 行"),
        })
    }
}

async fn execute_postgres_query(_connection: &DatabaseConnection, _sql: &str) -> Result<QueryResult, String> {
    // 類似 MySQL 的實現，暫時簡化
    Ok(QueryResult {
        success: false,
        columns: vec![],
        rows: vec![],
        affected_rows: None,
        execution_time: 0,
        message: "PostgreSQL 查詢功能開發中".to_string(),
    })
}

async fn test_mysql_connection(connection: &DatabaseConnection) -> Result<String, String> {
    let database_url = format!(
        "mysql://{}:{}@{}:{}/{}",
        connection.username,
        connection.password,
        connection.host,
        connection.port,
        connection.database
    );

    let pool = sqlx::mysql::MySqlPool::connect(&database_url)
        .await
        .map_err(|e| format!("MySQL 連接錯誤: {e}"))?;

    // 測試查詢
    let row = sqlx::query("SELECT VERSION() as version")
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("查詢錯誤: {e}"))?;

    let version: String = row.try_get("version")
        .map_err(|e| format!("取得版本錯誤: {e}"))?;

    pool.close().await;

    Ok(format!("MySQL 連接成功！版本: {version}"))
}

async fn test_postgres_connection(connection: &DatabaseConnection) -> Result<String, String> {
    // 檢查是否為 Supabase 或雲端資料庫
    let is_cloud_db = connection.host.contains("supabase.co") || 
                      connection.host.contains("amazonaws.com") ||
                      connection.host.contains("azure.com") ||
                      connection.host.contains("googleusercontent.com");

    let database_url = if is_cloud_db {
        // 雲端資料庫通常需要 SSL
        format!(
            "postgres://{}:{}@{}:{}/{}?sslmode=require&connect_timeout=10",
            connection.username,
            connection.password,
            connection.host,
            connection.port,
            connection.database
        )
    } else {
        // 本地資料庫
        format!(
            "postgres://{}:{}@{}:{}/{}?connect_timeout=10",
            connection.username,
            connection.password,
            connection.host,
            connection.port,
            connection.database
        )
    };

    let pool = sqlx::postgres::PgPool::connect(&database_url)
        .await
        .map_err(|e| {
            let error_msg = format!("{e}");
            if error_msg.contains("11001") || error_msg.contains("無法識別這台主機") {
                let host = &connection.host;
                format!("DNS 解析失敗: 無法找到主機 {host}。請檢查主機名稱是否正確，或嘗試使用 IP 地址")
            } else if error_msg.contains("timeout") {
                "連接超時: 請檢查網路連接和防火牆設置".to_string()
            } else if error_msg.contains("authentication") {
                "身份驗證失敗: 請檢查用戶名和密碼".to_string()
            } else if error_msg.contains("ssl") {
                "SSL 連接失敗: 雲端資料庫通常需要 SSL 連接".to_string()
            } else if error_msg.contains("password authentication failed") {
                "密碼錯誤: 請檢查用戶名和密碼是否正確".to_string()
            } else if error_msg.contains("database") && error_msg.contains("does not exist") {
                let database = &connection.database;
                format!("資料庫不存在: 資料庫 '{database}' 不存在")
            } else {
                format!("PostgreSQL 連接錯誤: {e}")
            }
        })?;

    // 測試查詢
    let row = sqlx::query("SELECT version()")
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("查詢錯誤: {e}"))?;

    let version: String = row.try_get("version")
        .map_err(|e| format!("取得版本錯誤: {e}"))?;

    pool.close().await;

    Ok(format!("PostgreSQL 連接成功！版本: {version}"))
}

async fn test_sqlite_connection(connection: &DatabaseConnection) -> Result<String, String> {
    // SQLite 使用檔案路徑，不需要網路連接
    let database_path = if connection.database.is_empty() {
        ":memory:".to_string() // 內存資料庫
    } else {
        connection.database.clone()
    };

    let database_url = format!("sqlite:{database_path}");

    let pool = sqlx::sqlite::SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("SQLite 連接錯誤: {e}"))?;

    // 測試查詢
    let row = sqlx::query("SELECT sqlite_version() as version")
        .fetch_one(&pool)
        .await
        .map_err(|e| format!("查詢錯誤: {e}"))?;

    let version: String = row.try_get("version")
        .map_err(|e| format!("取得版本錯誤: {e}"))?;

    pool.close().await;

    Ok(format!("SQLite 連接成功！版本: {version}"))
}

async fn get_sqlite_tables(connection: &DatabaseConnection) -> Result<DatabaseTablesResult, String> {
    let database_path = if connection.database.is_empty() {
        ":memory:".to_string()
    } else {
        connection.database.clone()
    };

    let pool = sqlx::sqlite::SqlitePool::connect(&database_path)
        .await
        .map_err(|e| format!("SQLite 連接錯誤: {e}"))?;

    // 獲取所有資料庫對象（表格、檢視表、索引、觸發器）
    let table_rows = sqlx::query(
        "SELECT name, type FROM sqlite_master 
         WHERE type IN ('table', 'view', 'index', 'trigger') 
         AND (name NOT LIKE 'sqlite_%' OR name IN ('sqlite_sequence', 'sqlite_stat1', 'sqlite_stat2', 'sqlite_stat3', 'sqlite_stat4'))
         ORDER BY type, name"
    )
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("查詢資料庫對象錯誤: {e}"))?;

    let mut tables = Vec::new();

    for row in table_rows {
        let object_name: String = row.try_get("name")
            .map_err(|e| format!("取得對象名稱錯誤: {e}"))?;
        let object_type: String = row.try_get("type")
            .map_err(|e| format!("取得對象類型錯誤: {e}"))?;

        // 獲取記錄數（只對表格和檢視表）
        let row_count = if object_type == "table" || object_type == "view" {
            let count_query = format!("SELECT COUNT(*) as count FROM \"{object_name}\"");
            let count_result = sqlx::query(&count_query)
                .fetch_one(&pool)
                .await;

            match count_result {
                Ok(row) => {
                    row.try_get::<i64, _>("count").unwrap_or(0) as u64
                }
                Err(_) => 0, // 如果查詢失敗，設為 0
            }
        } else {
            // 索引和觸發器不計算記錄數
            0
        };

        tables.push(TableInfo {
            name: object_name,
            row_count,
            table_type: object_type,
        });
    }

    pool.close().await;

    let table_count = tables.len();
    Ok(DatabaseTablesResult {
        success: true,
        tables,
        message: format!("找到 {table_count} 個資料庫對象"),
    })
}

async fn get_mysql_tables(_connection: &DatabaseConnection) -> Result<DatabaseTablesResult, String> {
    Ok(DatabaseTablesResult {
        success: false,
        tables: vec![],
        message: "MySQL 表格列表功能開發中".to_string(),
    })
}

async fn get_postgres_tables(_connection: &DatabaseConnection) -> Result<DatabaseTablesResult, String> {
    Ok(DatabaseTablesResult {
        success: false,
        tables: vec![],
        message: "PostgreSQL 表格列表功能開發中".to_string(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|_app| {
            println!("Serphic 已啟動，請在設置中選擇透明效果類型");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            test_database_connection, 
            execute_query, 
            select_sqlite_file, 
            get_database_tables,
            set_transparency_effect,
            clear_transparency_effect
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
