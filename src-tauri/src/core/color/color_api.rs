// // src-tauri/src/windows_color.rs
// use std::ptr;
// use winapi::{
//     ctypes::c_void,
//     um::{
//         wingdi::{
//             BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC,
//             GetPixel, ReleaseDC, SelectObject, SRCCOPY,
//         },
//         winuser::{GetCursorPos, GetDesktopWindow, GetSystemMetrics, SM_CXSCREEN, SM_CYSCREEN},
//     },
// };

// /// 获取指定坐标的像素颜色
// pub fn get_pixel_color(x: i32, y: i32) -> Result<(u8, u8, u8), Box<dyn std::error::Error>> {
//     unsafe {
//         let hdc = GetDC(GetDesktopWindow());
//         if hdc.is_null() {
//             return Err("Failed to get device context".into());
//         }

//         let color = GetPixel(hdc, x, y);
//         ReleaseDC(GetDesktopWindow(), hdc);

//         if color == 0xFFFFFFFF {
//             return Err("Failed to get pixel color".into());
//         }

//         // Windows GetPixel 返回的是 0x00bbggrr 格式
//         let r = (color & 0xFF) as u8;
//         let g = ((color >> 8) & 0xFF) as u8;
//         let b = ((color >> 16) & 0xFF) as u8;

//         Ok((r, g, b))
//     }
// }

// /// 获取鼠标当前位置的屏幕坐标
// pub fn get_cursor_pos() -> Result<(i32, i32), Box<dyn std::error::Error>> {
//     unsafe {
//         let mut point = winapi::shared::windef::POINT { x: 0, y: 0 };
//         if GetCursorPos(&mut point) == 0 {
//             return Err("Failed to get cursor position".into());
//         }
//         Ok((point.x, point.y))
//     }
// }

// /// 获取屏幕尺寸
// pub fn get_screen_size() -> Result<(i32, i32), Box<dyn std::error::Error>> {
//     unsafe {
//         let width = GetSystemMetrics(SM_CXSCREEN);
//         let height = GetSystemMetrics(SM_CYSCREEN);
//         Ok((width, height))
//     }
// }

// /// 高级方法：捕获屏幕区域并获取颜色（更精确）
// pub fn get_pixel_color_advanced(
//     x: i32,
//     y: i32,
// ) -> Result<(u8, u8, u8), Box<dyn std::error::Error>> {
//     unsafe {
//         let hdc_screen = GetDC(ptr::null_mut());
//         let hdc_mem = CreateCompatibleDC(hdc_screen);

//         if hdc_mem.is_null() {
//             ReleaseDC(ptr::null_mut(), hdc_screen);
//             return Err("Failed to create compatible DC".into());
//         }

//         // 创建 1x1 的位图
//         let hbitmap = CreateCompatibleBitmap(hdc_screen, 1, 1);
//         if hbitmap.is_null() {
//             DeleteDC(hdc_mem);
//             ReleaseDC(ptr::null_mut(), hdc_screen);
//             return Err("Failed to create compatible bitmap".into());
//         }

//         // 选择位图到内存 DC
//         let _old_bitmap = SelectObject(hdc_mem, hbitmap as *mut c_void);

//         // 复制屏幕像素到内存位图
//         if BitBlt(hdc_mem, 0, 0, 1, 1, hdc_screen, x, y, SRCCOPY) == 0 {
//             DeleteObject(hbitmap as *mut c_void);
//             DeleteDC(hdc_mem);
//             ReleaseDC(ptr::null_mut(), hdc_screen);
//             return Err("Failed to copy screen pixels".into());
//         }

//         // 从位图获取像素颜色
//         let mut pixel: u32 = 0;
//         let bits_read = winapi::um::wingdi::GetBitmapBits(
//             hbitmap,
//             4, // 4 bytes for 32-bit color
//             &mut pixel as *mut _ as *mut c_void,
//         );

//         // 清理资源
//         DeleteObject(hbitmap as *mut c_void);
//         DeleteDC(hdc_mem);
//         ReleaseDC(ptr::null_mut(), hdc_screen);

//         if bits_read != 4 {
//             return Err("Failed to read bitmap bits".into());
//         }

//         // 像素格式通常是 0xAARRGGBB 或 0x00BBGGRR
//         let r = ((pixel >> 16) & 0xFF) as u8;
//         let g = ((pixel >> 8) & 0xFF) as u8;
//         let b = (pixel & 0xFF) as u8;

//         Ok((r, g, b))
//     }
// }

// /// 使用 windows crate 的现代化实现
// #[cfg(feature = "windows_crate")]
// pub fn get_pixel_color_modern(x: i32, y: i32) -> windows::Result<(u8, u8, u8)> {
//     use windows::Win32::{
//         Graphics::Gdi::{GetDC, GetDesktopWindow, GetPixel, ReleaseDC},
//         UI::WindowsAndMessaging::GetCursorPos,
//     };

//     unsafe {
//         let hwnd = GetDesktopWindow();
//         let hdc = GetDC(hwnd);

//         let color = GetPixel(hdc, x, y);
//         ReleaseDC(hwnd, hdc);

//         let r = (color & 0xFF) as u8;
//         let g = ((color >> 8) & 0xFF) as u8;
//         let b = ((color >> 16) & 0xFF) as u8;

//         Ok((r, g, b))
//     }
// }
