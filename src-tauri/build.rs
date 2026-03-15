mod liquid_glass_icon;

fn main() {
    tauri_build::build();

    // Compile macOS Liquid Glass icon
    #[cfg(target_os = "macos")]
    {
        liquid_glass_icon::compile_icon();
    }
}
