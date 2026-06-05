// Prevent the additional file descriptor being opened on windows
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::env;
use tauri::api::notification::Notification;

/// 统一模型存储路径 — 恒久保存机制
const MODEL_STORAGE_PATH: &str = "/Users/yanyu/models";

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    os: String,
    arch: String,
    version: String,
    hostname: String,
    username: String,
}

#[derive(Serialize)]
struct ModelStorageInfo {
    path: String,
    env_var: String,
    blobs_exist: bool,
    manifests_exist: bool,
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: std::env::consts::ARCH.to_string(), // version approximation
        hostname: hostname(),
        username: whoami::username(),
    })
}

#[tauri::command]
fn get_model_storage_info() -> Result<ModelStorageInfo, String> {
    let blobs_path = format!("{}/blobs", MODEL_STORAGE_PATH);
    let manifests_path = format!("{}/manifests", MODEL_STORAGE_PATH);

    Ok(ModelStorageInfo {
        path: MODEL_STORAGE_PATH.to_string(),
        env_var: "OLLAMA_MODELS".to_string(),
        blobs_exist: std::path::Path::new(&blobs_path).exists(),
        manifests_exist: std::path::Path::new(&manifests_path).exists(),
    })
}

fn hostname() -> String {
    #[cfg(target_os = "macos")]
    {
        Command::new("hostname")
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string())
            .unwrap_or("unknown".to_string())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Command::new("hostname")
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string())
            .unwrap_or("unknown".to_string())
    }
}

#[tauri::command]
fn exec_command(command: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&command)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    let result = match std::env::consts::OS {
        "macos" => Command::new("open").arg(&url).spawn(),
        "windows" => Command::new("cmd").args(["/C", "start", "", &url]).spawn(),
        _ => Command::new("xdg-open").arg(&url).spawn(),
    };

    result.map_err(|e| format!("Failed to open URL: {}", e))?;
    Ok(())
}

#[tauri::command]
fn show_notification(app_handle: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    Notification::new(&app_handle.config().tauri.bundle.identifier)
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))
}

fn main() {
    // 设置统一模型存储路径 — 恒久保存机制
    // 确保 Ollama 子进程继承此环境变量，使模型存储在 /Users/yanyu/models
    env::set_var("OLLAMA_MODELS", MODEL_STORAGE_PATH);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_model_storage_info,
            exec_command,
            open_url,
            show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
