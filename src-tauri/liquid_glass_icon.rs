/// macOS Liquid Glass icon compilation
///
/// This module handles compiling the .icon format to Assets.car using Apple's actool.
/// The Liquid Glass icon system supports appearance variants (Default, Dark, Tinted)
/// and is new in macOS 26 Tahoe.
///
/// Reference:
/// - https://developer.apple.com/documentation/xcode/configuring-your-app-icon-for-macos
use std::process::Command;

pub fn compile_icon() {
    let project_root = env!("CARGO_MANIFEST_DIR");
    let icon_source = format!("{}/icons/Chiri.icon", project_root);
    let gen_dir = format!("{}/gen", project_root);

    // Create gen directory if it doesn't exist
    std::fs::create_dir_all(&gen_dir).expect("Failed to create gen directory");

    if std::path::Path::new(&icon_source).exists() {
        println!("cargo:rerun-if-changed={}", icon_source);
        println!("cargo:rerun-if-changed={}/icon.json", icon_source);
        println!("cargo:rerun-if-changed={}/Assets", icon_source);

        let partial_plist = format!("{}/partial.plist", gen_dir);
        let output = Command::new("xcrun")
            .args([
                "actool",
                "--compile",
                &gen_dir,
                "--output-format",
                "human-readable-text",
                "--output-partial-info-plist",
                &partial_plist,
                "--app-icon",
                "Chiri",
                "--include-all-app-icons",
                "--target-device",
                "mac",
                "--minimum-deployment-target",
                "26.0",
                "--platform",
                "macosx",
                &icon_source,
            ])
            .output();

        match output {
            Ok(output) => {
                if !output.status.success() {
                    eprintln!("actool stderr: {}", String::from_utf8_lossy(&output.stderr));
                    eprintln!("actool stdout: {}", String::from_utf8_lossy(&output.stdout));
                    panic!("actool failed to compile icon");
                }
                println!("Successfully compiled icon to {}", gen_dir);
            }
            Err(e) => {
                eprintln!("Failed to execute xcrun actool: {}", e);
                eprintln!("Make sure you have Xcode Command Line Tools installed");
                panic!("Icon compilation failed");
            }
        }
    } else {
        println!(
            "cargo:warning=Icon source not found at {}, skipping icon compilation",
            icon_source
        );
    }
}
