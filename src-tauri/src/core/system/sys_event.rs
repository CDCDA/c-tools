// src-tauri/src/system_events.rs

use tauri::{AppHandle, PhysicalPosition};
// 导入路径调整
use once_cell::sync::Lazy;
use std::sync::{Arc, Mutex};
use tauri::Emitter;
use windows::Win32::Foundation::{LPARAM, LRESULT, WPARAM};

use windows::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx,
    SetWindowsHookExW,
    UnhookWindowsHookEx,
    HHOOK, // HHOOK 现在在这里
    MSLLHOOKSTRUCT,
    WH_MOUSE_LL,
    WM_LBUTTONUP,
    WM_MOUSEMOVE,
    WM_RBUTTONUP,
};

// 用于存储 Tauri AppHandle，以便在钩子函数中发送事件
static APP_HANDLE: Lazy<Arc<Mutex<Option<AppHandle>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

// 全局钩子句柄
static mut GLOBAL_MOUSE_HOOK: HHOOK = HHOOK(0);

// 钩子回调函数
unsafe extern "system" fn mouse_hook_callback(
    n_code: i32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    if n_code >= 0 {
        let mouse_info = *(l_param.0 as *mut MSLLHOOKSTRUCT);
        let app_handle_guard = APP_HANDLE.lock().unwrap();

        if let Some(app) = app_handle_guard.as_ref() {
            let x = mouse_info.pt.x;
            let y = mouse_info.pt.y;

            match w_param.0 as u32 {
                WM_MOUSEMOVE => {
                    let _ = app.emit("global-mousemove", PhysicalPosition { x, y });
                    // <-- emit_all 改为 emit
                }
                WM_LBUTTONUP => {
                    let _ = app.emit("global-mouseup", (x, y, 1)); // <-- emit_all 改为 emit
                }
                WM_RBUTTONUP => {
                    let _ = app.emit("global-mouseup", (x, y, 2)); // <-- emit_all 改为 emit
                }
                // 可以添加其他按钮
                _ => {}
            }
        }
    }
    CallNextHookEx(GLOBAL_MOUSE_HOOK, n_code, w_param, l_param)
}

/// 设置全局鼠标钩子并启动监听线程
pub fn setup_global_mouse_hook(app_handle: AppHandle) {
    // 存储 AppHandle
    *APP_HANDLE.lock().unwrap() = Some(app_handle.clone());

    std::thread::spawn(move || {
        unsafe {
            GLOBAL_MOUSE_HOOK = SetWindowsHookExW(
                WH_MOUSE_LL,
                Some(mouse_hook_callback),
                None, // hInstance
                0,    // dwThreadId (0 表示所有线程)
            )
            .expect("Failed to set global mouse hook");

            println!("Global mouse hook set up. Waiting for events...");
            loop {
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
        }
    });
}

// 解除全局鼠标钩子 (在应用关闭时调用)
// pub fn unhook_global_mouse_hook() {
//     unsafe {
//         if GLOBAL_MOUSE_HOOK.0 != 0 {
//             UnhookWindowsHookEx(GLOBAL_MOUSE_HOOK);
//             GLOBAL_MOUSE_HOOK = HHOOK(0); // 重置句柄
//             println!("Global mouse hook unhooked.");
//         }
//     }
// }
