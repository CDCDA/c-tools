use arboard::Clipboard;
use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings,
};

// 模拟粘贴
pub fn handle_paste(text: &str) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    // 将文本设置到系统剪贴板
    let mut clipboard = Clipboard::new().unwrap();
    clipboard.set_text(text).unwrap();
    enigo.key(Key::Control, Press).unwrap();
    enigo.key(Key::Unicode('v'), Click).unwrap();
    enigo.key(Key::Control, Release).unwrap();
}
