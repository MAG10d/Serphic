fn main() {
    // Print build information for debugging
    println!("cargo:rerun-if-changed=build.rs");
    
    // Print target information for CI debugging
    if let Ok(target) = std::env::var("TARGET") {
        println!("cargo:warning=Building for target: {}", target);
    }
    
    if let Ok(profile) = std::env::var("PROFILE") {
        println!("cargo:warning=Building with profile: {}", profile);
    }
    
    // Handle platform-specific compilation
    #[cfg(target_os = "linux")]
    {
        println!("cargo:warning=Linux build: window-vibrancy features disabled");
    }
    
    #[cfg(target_os = "windows")]
    {
        println!("cargo:warning=Windows build: window-vibrancy features enabled");
    }
    
    #[cfg(target_os = "macos")]
    {
        println!("cargo:warning=macOS build: window-vibrancy features enabled");
    }
    
    tauri_build::build()
}
