use base64::{engine::general_purpose, Engine as _};
use image::{ImageBuffer, ImageFormat, Rgb, RgbaImage};
use screenshots::Screen;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use std::mem;
use windows::Win32::Foundation::{COLORREF, HWND}; // 移除 RECT
use windows::Win32::Graphics::Gdi::{
    BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC, GetDIBits,
    GetPixel, ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS, SRCCOPY,
};
use windows::Win32::UI::WindowsAndMessaging::{GetCursorPos, GetDesktopWindow}; // 用于将图像数据写入内存缓冲区

// 定义一个结构体来表示RGB颜色
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct RgbColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

// 获取鼠标当前位置的颜色
#[tauri::command]
pub fn get_color_at_cursor() -> Option<RgbColor> {
    let mut win_point = windows::Win32::Foundation::POINT::default();
    unsafe {
        if GetCursorPos(&mut win_point).is_ok() {
            // point.x = win_point.x; // PhysicalPosition not used here
            // point.y = win_point.y;
        } else {
            return None; // 无法获取鼠标位置
        }
    }

    unsafe {
        let hdc = GetDC(HWND(0)); // 获取桌面窗口的设备上下文
        if hdc.0 == 0 {
            return None;
        }

        let pixel_color = GetPixel(hdc, win_point.x, win_point.y); // 使用 win_point.x, win_point.y
        ReleaseDC(HWND(0), hdc);

        // 检查是否是无效颜色 (COLORREF(0xFFFFFFFF) 是 GetPixel 失败时的返回值)
        if pixel_color != COLORREF(0xFFFFFFFF) {
            let r = (pixel_color.0 & 0x000000FF) as u8;
            let g = ((pixel_color.0 & 0x0000FF00) >> 8) as u8;
            let b = ((pixel_color.0 & 0x00FF0000) >> 16) as u8;
            Some(RgbColor { r, g, b })
        } else {
            None
        }
    }
}

#[tauri::command]
pub fn capture_full_screen() -> Option<String> {
    // println!("尝试进行全屏截图并编码为 Base64...");

    let screens = match Screen::all() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("获取屏幕信息失败: {}", e);
            return None;
        }
    };

    if screens.is_empty() {
        eprintln!("未检测到任何屏幕，无法截图。");
        return None;
    }

    // 这里我们选择第一个屏幕进行全屏截图。
    let screen = &screens[0];
    // println!(
    //     "正在截取屏幕: id={:?}, size={:?}x{:?}",
    //     screen.display_info.id, screen.display_info.width, screen.display_info.height
    // );

    let screenshot_image = match screen.capture() {
        Ok(img) => img,
        Err(e) => {
            eprintln!("捕获屏幕失败: {}", e);
            return None;
        }
    };

    // 直接调用 `to_png()` 获取 PNG 格式的字节数据
    let png_bytes = match screenshot_image.to_png() {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("将图像编码为 PNG 失败: {}", e);
            return None;
        }
    };

    // 将 PNG 字节数据编码为 Base64 字符串
    let base64_string = general_purpose::STANDARD.encode(&png_bytes);

    // println!("\n--- 全屏截图 Base64 数据 (前200字符) ---");
    // println!(
    //     "{}",
    //     &base64_string[..std::cmp::min(base64_string.len(), 200)]
    // );
    if base64_string.len() > 200 {
        // println!("...(完整 Base64 字符串已生成，此处仅显示部分)");
    } else {
        // println!("(完整 Base64 字符串已显示)");
    }

    if base64_string.is_empty() {
        eprintln!("生成的 Base64 字符串为空！");
        None
    } else {
        // println!("\nBase64 编码的 PNG 图像数据已成功生成。");
        Some(format!("data:image/png;base64,{}", base64_string))
    }
}
/// 捕获鼠标周围指定区域的屏幕，并返回 Base64 编码的 PNG 图像
#[tauri::command]
pub fn capture_magnifier_area(
    center_x: i32,
    center_y: i32,
    capture_size: i32, // 捕获的正方形区域的边长 (原始像素)
) -> Option<String> {
    unsafe {
        let hdc_screen = GetDC(GetDesktopWindow());
        if hdc_screen.0 == 0 {
            return None;
        }

        let hdc_mem = CreateCompatibleDC(hdc_screen);
        if hdc_mem.0 == 0 {
            ReleaseDC(GetDesktopWindow(), hdc_screen);
            return None;
        }

        let hbmp = CreateCompatibleBitmap(hdc_screen, capture_size, capture_size);
        if hbmp.0 == 0 {
            DeleteDC(hdc_mem);
            ReleaseDC(GetDesktopWindow(), hdc_screen);
            return None;
        }

        let old_obj = SelectObject(hdc_mem, hbmp);

        // 计算捕获区域的左上角坐标
        let src_x = center_x - capture_size / 2;
        let src_y = center_y - capture_size / 2;

        // 进行位块传输，从屏幕复制到内存位图
        if BitBlt(
            // 检查 is_ok()，而不是 .as_bool()
            hdc_mem,
            0,
            0,
            capture_size,
            capture_size,
            hdc_screen,
            src_x,
            src_y,
            SRCCOPY,
        )
        .is_ok()
        {
            // 获取位图数据
            let mut bmi = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: mem::size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: capture_size,
                    biHeight: capture_size, // 负数表示DIB是顶到底的
                    biPlanes: 1,
                    biBitCount: 24, // 24位RGB
                    biCompression: 0,
                    biSizeImage: 0,
                    biXPelsPerMeter: 0,
                    biYPelsPerMeter: 0,
                    biClrUsed: 0,
                    biClrImportant: 0,
                },
                bmiColors: [windows::Win32::Graphics::Gdi::RGBQUAD {
                    rgbBlue: 0,
                    rgbGreen: 0,
                    rgbRed: 0,
                    rgbReserved: 0,
                }; 1],
            };

            // 计算图像数据大小
            let pitch = (((capture_size as u32 * 24 + 31) / 32) * 4) as usize; // 每行字节数 (4字节对齐)
            let buffer_size = (pitch * capture_size as usize) as usize;
            let mut raw_data = vec![0u8; buffer_size];

            if GetDIBits(
                hdc_mem,
                hbmp,
                0,
                capture_size as u32,
                Some(raw_data.as_mut_ptr() as *mut _), // 包装成 Some()
                &mut bmi as *mut _,                    // 直接传递指针
                DIB_RGB_COLORS,
            ) == 0
            {
                SelectObject(hdc_mem, old_obj);
                DeleteObject(hbmp);
                DeleteDC(hdc_mem);
                ReleaseDC(GetDesktopWindow(), hdc_screen);
                return None;
            }

            // 创建 image crate 的 ImageBuffer
            let mut img =
                ImageBuffer::<Rgb<u8>, Vec<u8>>::new(capture_size as u32, capture_size as u32);

            // Windows BMP 数据是 BGR 顺序，我们需要转换为 RGB
            for y in 0..capture_size as u32 {
                for x in 0..capture_size as u32 {
                    // raw_data 中的 y 对应的是 ImageBuffer 中的 (capture_size - 1 - y) 行
                    let buffer_idx = (y as usize * pitch) + (x as usize * 3);
                    let b = raw_data[buffer_idx];
                    let g = raw_data[buffer_idx + 1];
                    let r = raw_data[buffer_idx + 2];
                    img.put_pixel(x, capture_size as u32 - 1 - y, Rgb([r, g, b]));
                }
            }

            // 将 ImageBuffer 编码为 PNG，然后 Base64 编码
            let mut png_bytes: Vec<u8> = Vec::new();
            img.write_to(
                &mut std::io::Cursor::new(&mut png_bytes),
                image::ImageFormat::Png,
            )
            .ok()?;

            let base64_image = general_purpose::STANDARD.encode(&png_bytes);

            // 清理 GDI 资源
            SelectObject(hdc_mem, old_obj);
            DeleteObject(hbmp);
            DeleteDC(hdc_mem);
            ReleaseDC(GetDesktopWindow(), hdc_screen);

            Some(format!("data:image/png;base64,{}", base64_image))
        } else {
            // BitBlt 失败时清理 GDI 资源
            SelectObject(hdc_mem, old_obj);
            DeleteObject(hbmp);
            DeleteDC(hdc_mem);
            ReleaseDC(GetDesktopWindow(), hdc_screen);
            None
        }
    }
}
