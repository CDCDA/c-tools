use base64::{engine::general_purpose, Engine as _};
use image::{ImageBuffer, Rgb};
use mouse_position::mouse_position::Mouse;
use screenshots::Screen;

use serde::{Deserialize, Serialize};
use std::mem;
use windows::Win32::Foundation::{COLORREF, HWND, POINT};
use windows::Win32::Graphics::Gdi::{
    BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC, GetDIBits,
    GetDeviceCaps, GetPixel, ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS,
    LOGPIXELSX, LOGPIXELSY, SRCCOPY,
};
use windows::Win32::UI::WindowsAndMessaging::{GetCursorPos, GetDesktopWindow};

// 定义一个结构体来表示RGB颜色
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct RgbColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

// 获取系统DPI缩放比例
fn get_system_dpi_scale() -> f64 {
    unsafe {
        let hdc = GetDC(HWND(0));
        if hdc.0 == 0 {
            return 1.0;
        }

        let dpi_x = GetDeviceCaps(hdc, LOGPIXELSX) as f64;
        let dpi_y = GetDeviceCaps(hdc, LOGPIXELSY) as f64;
        ReleaseDC(HWND(0), hdc);

        // 标准DPI是96，计算缩放比例
        let scale_x = dpi_x / 96.0;
        let scale_y = dpi_y / 96.0;

        // 返回较大的缩放比例以确保兼容性
        scale_x.max(scale_y)
    }
}

// 获取物理坐标对应的逻辑坐标（考虑DPI缩放）
fn physical_to_logical_point(mut point: POINT) -> POINT {
    unsafe {
        let hdc = GetDC(HWND(0));
        if hdc.0 == 0 {
            return point;
        }

        let dpi_x = GetDeviceCaps(hdc, LOGPIXELSX) as f64;
        let dpi_y = GetDeviceCaps(hdc, LOGPIXELSY) as f64;
        ReleaseDC(HWND(0), hdc);

        // 标准DPI是96
        point.x = (point.x as f64 * 96.0 / dpi_x) as i32;
        point.y = (point.y as f64 * 96.0 / dpi_y) as i32;

        point
    }
}

// 获取逻辑坐标对应的物理坐标（考虑DPI缩放）
fn logical_to_physical_point(mut point: POINT) -> POINT {
    unsafe {
        let hdc = GetDC(HWND(0));
        if hdc.0 == 0 {
            return point;
        }

        let dpi_x = GetDeviceCaps(hdc, LOGPIXELSX) as f64;
        let dpi_y = GetDeviceCaps(hdc, LOGPIXELSY) as f64;
        ReleaseDC(HWND(0), hdc);

        // 标准DPI是96
        point.x = (point.x as f64 * dpi_x / 96.0) as i32;
        point.y = (point.y as f64 * dpi_y / 96.0) as i32;

        point
    }
}

// 获取鼠标当前位置的颜色
#[tauri::command]
pub fn get_color_at_cursor() -> Option<RgbColor> {
    let mut win_point = windows::Win32::Foundation::POINT::default();
    unsafe {
        if GetCursorPos(&mut win_point).is_ok() {
            // 获取物理坐标（已经考虑了DPI）
        } else {
            return None;
        }
    }

    unsafe {
        let hdc = GetDC(HWND(0));
        if hdc.0 == 0 {
            return None;
        }

        let pixel_color = GetPixel(hdc, win_point.x, win_point.y);
        ReleaseDC(HWND(0), hdc);

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
    // 1. 获取鼠标当前所在的坐标
    // 注意：这里使用的是 Mouse::get_position() 而不是 mouse_position()
    let position = Mouse::get_mouse_position();

    let (mouse_x, mouse_y) = match position {
        Mouse::Position { x, y } => (x, y),
        Mouse::Error => {
            eprintln!("无法获取鼠标位置，尝试获取主屏幕");
            // 如果获取不到鼠标位置，可以设为 (0,0) 或者后续逻辑处理
            (0, 0)
        }
    };

    // 2. 根据鼠标坐标获取对应的屏幕
    let screen = match Screen::from_point(mouse_x, mouse_y) {
        Ok(s) => s,
        Err(_) => {
            // 如果坐标处没找到屏幕，尝试获取主屏幕
            let all_screens = Screen::all().ok()?;
            all_screens
                .into_iter()
                .find(|s| s.display_info.is_primary)
                .unwrap_or_else(|| {
                    // 如果连主屏都找不到，就取列表里的第一个
                    Screen::all().unwrap()[0].clone()
                })
        }
    };

    // 3. 捕获该屏幕
    let screenshot_image = match screen.capture() {
        Ok(img) => img,
        Err(e) => {
            eprintln!("捕获屏幕失败: {}", e);
            return None;
        }
    };

    // 4. 将图像编码为 PNG
    let png_bytes = match screenshot_image.to_png() {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("编码 PNG 失败: {}", e);
            return None;
        }
    };

    // 5. 编码为 Base64
    let base64_string = general_purpose::STANDARD.encode(&png_bytes);

    if base64_string.is_empty() {
        None
    } else {
        Some(format!("data:image/png;base64,{}", base64_string))
    }
}

/// 捕获鼠标周围指定区域的屏幕，并返回 Base64 编码的 PNG 图像
#[tauri::command]
pub fn capture_magnifier_area(
    center_x: i32,
    center_y: i32,
    capture_size: i32, // 捕获的正方形区域的边长 (逻辑像素)
) -> Option<String> {
    // 获取DPI缩放比例
    let dpi_scale = get_system_dpi_scale();

    // 将逻辑坐标转换为物理坐标
    let physical_center = logical_to_physical_point(POINT {
        x: center_x,
        y: center_y,
    });
    let physical_size = (capture_size as f64 * dpi_scale) as i32;

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

        let hbmp = CreateCompatibleBitmap(hdc_screen, physical_size, physical_size);
        if hbmp.0 == 0 {
            DeleteDC(hdc_mem);
            ReleaseDC(GetDesktopWindow(), hdc_screen);
            return None;
        }

        let old_obj = SelectObject(hdc_mem, hbmp);

        // 计算捕获区域的左上角坐标
        let src_x = physical_center.x - physical_size / 2;
        let src_y = physical_center.y - physical_size / 2;

        // 进行位块传输，从屏幕复制到内存位图
        if BitBlt(
            hdc_mem,
            0,
            0,
            physical_size,
            physical_size,
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
                    biWidth: physical_size,
                    biHeight: -physical_size, // 负数表示DIB是顶到底的
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
            let pitch = (((physical_size as u32 * 24 + 31) / 32) * 4) as usize;
            let buffer_size = pitch * physical_size as usize;
            let mut raw_data = vec![0u8; buffer_size];

            if GetDIBits(
                hdc_mem,
                hbmp,
                0,
                physical_size as u32,
                Some(raw_data.as_mut_ptr() as *mut _),
                &mut bmi as *mut _,
                DIB_RGB_COLORS,
            ) == 0
            {
                SelectObject(hdc_mem, old_obj);
                DeleteObject(hbmp);
                DeleteDC(hdc_mem);
                ReleaseDC(GetDesktopWindow(), hdc_screen);
                return None;
            }

            // 如果需要缩放回逻辑大小
            let output_size = capture_size as u32;

            // 创建 image crate 的 ImageBuffer
            let mut img = if dpi_scale != 1.0 {
                // 如果DPI缩放不等于1，需要缩放图像
                let mut src_img = ImageBuffer::<Rgb<u8>, Vec<u8>>::new(
                    physical_size as u32,
                    physical_size as u32,
                );

                // 填充原始图像
                for y in 0..physical_size as u32 {
                    for x in 0..physical_size as u32 {
                        let buffer_idx = (y as usize * pitch) + (x as usize * 3);
                        let b = raw_data[buffer_idx];
                        let g = raw_data[buffer_idx + 1];
                        let r = raw_data[buffer_idx + 2];
                        src_img.put_pixel(x, y, Rgb([r, g, b]));
                    }
                }

                // 使用 image crate 的 resize 方法进行缩放
                image::imageops::resize(
                    &src_img,
                    output_size,
                    output_size,
                    image::imageops::FilterType::Lanczos3,
                )
            } else {
                // 不需要缩放，直接创建目标大小的图像
                let mut img = ImageBuffer::<Rgb<u8>, Vec<u8>>::new(output_size, output_size);

                for y in 0..output_size {
                    for x in 0..output_size {
                        let buffer_idx = (y as usize * pitch) + (x as usize * 3);
                        let b = raw_data[buffer_idx];
                        let g = raw_data[buffer_idx + 1];
                        let r = raw_data[buffer_idx + 2];
                        img.put_pixel(x, y, Rgb([r, g, b]));
                    }
                }

                img
            };

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
            SelectObject(hdc_mem, old_obj);
            DeleteObject(hbmp);
            DeleteDC(hdc_mem);
            ReleaseDC(GetDesktopWindow(), hdc_screen);
            None
        }
    }
}

// 使用 screenshots crate 的备选实现（考虑DPI缩放）
#[tauri::command]
pub fn capture_area(
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    ignore_dpi: bool, // 是否忽略DPI缩放
) -> Option<String> {
    // 参数验证
    if width == 0 || height == 0 {
        eprintln!("截图区域尺寸无效: {}x{}", width, height);
        return None;
    }

    let screens = match Screen::all() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("获取屏幕信息失败: {}", e);
            return None;
        }
    };

    if screens.is_empty() {
        eprintln!("未检测到任何屏幕");
        return None;
    }

    // 获取DPI缩放比例
    let dpi_scale = if ignore_dpi {
        1.0
    } else {
        get_system_dpi_scale()
    };

    // 将逻辑坐标转换为物理坐标
    let physical_point = logical_to_physical_point(POINT { x, y });
    let physical_width = (width as f64 * dpi_scale).round() as u32;
    let physical_height = (height as f64 * dpi_scale).round() as u32;

    // 找到包含指定坐标的屏幕
    let target_screen = screens.iter().find(|screen| {
        let info = &screen.display_info;
        physical_point.x >= info.x
            && physical_point.x < info.x + info.width as i32
            && physical_point.y >= info.y
            && physical_point.y < info.y + info.height as i32
    });

    let screen = match target_screen {
        Some(s) => s,
        None => {
            eprintln!("未找到包含坐标 ({}, {}) 的屏幕", x, y);
            return None;
        }
    };

    // 计算在屏幕内的相对坐标
    let screen_x = (physical_point.x - screen.display_info.x).max(0) as u32;
    let screen_y = (physical_point.y - screen.display_info.y).max(0) as u32;

    // 确保截图区域不超出屏幕边界
    let actual_width = physical_width.min(screen.display_info.width - screen_x);
    let actual_height = physical_height.min(screen.display_info.height - screen_y);

    if actual_width == 0 || actual_height == 0 {
        eprintln!("截图区域超出屏幕边界");
        return None;
    }

    let screenshot_image = match screen.capture_area(
        screen_x as i32,
        screen_y as i32,
        actual_width,
        actual_height,
    ) {
        Ok(img) => img,
        Err(e) => {
            eprintln!("捕获区域失败: {}", e);
            return None;
        }
    };

    // 如果需要，将图像缩放到逻辑大小
    let final_image = if dpi_scale != 1.0 && !ignore_dpi {
        // 使用 image crate 进行高质量缩放
        let img_buffer: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(
            screenshot_image.width(),
            screenshot_image.height(),
            screenshot_image.to_png().ok()?,
        )?;

        let resized = image::imageops::resize(
            &img_buffer,
            width,
            height,
            image::imageops::FilterType::Lanczos3,
        );

        // 将缩放后的图像转换回 screenshots::Image
        screenshots::Image::new(resized.width(), resized.height(), resized.into_raw())
    } else {
        screenshot_image
    };

    // 编码为 PNG
    let png_bytes = match final_image.to_png() {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("PNG 编码失败: {}", e);
            return None;
        }
    };

    let base64_string = general_purpose::STANDARD.encode(&png_bytes);
    Some(format!("data:image/png;base64,{}", base64_string))
}

// 辅助函数：获取当前系统的DPI信息
#[tauri::command]
pub fn get_system_dpi_info() -> serde_json::Value {
    let scale = get_system_dpi_scale();

    serde_json::json!({
        "dpi_scale": scale,
        "is_high_dpi": scale > 1.0,
        "description": if scale > 1.0 {
            format!("高DPI屏幕 (缩放比例: {:.2}x)", scale)
        } else {
            "标准DPI屏幕".to_string()
        }
    })
}
