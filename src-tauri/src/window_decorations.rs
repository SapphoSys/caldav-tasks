// Desktop environment detection and GTK titlebar management for Linux
#![cfg(target_os = "linux")]

use std::env;

/// Detects if the current desktop environment needs GTK client-side decorations
/// Returns true for GNOME, COSMIC, and other DEs that work better with GTK decorations
pub fn needs_gtk_decorations() -> bool {
    let desktop = env::var("XDG_CURRENT_DESKTOP")
        .ok()
        .map(|d| d.to_lowercase())
        .unwrap_or_default();

    let session = env::var("DESKTOP_SESSION")
        .ok()
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    // GNOME and GNOME-based DEs
    if desktop.contains("gnome")
        || desktop.contains("ubuntu") // Ubuntu uses GNOME by default
        || session.contains("gnome")
        || env::var("GNOME_DESKTOP_SESSION_ID").is_ok()
    {
        return true;
    }

    // COSMIC DE - has issues with window dragging without GTK decorations
    if desktop.contains("cosmic") || session.contains("cosmic") {
        return true;
    }

    false
}

/// configures the titlebar based on the desktop environment
/// must be called BEFORE the window is shown/realized
///
/// - GNOME, COSMIC: keep GTK client-side decorations (works well, draggable)
/// - KDE, others: use native window decorations (integrates better)
///
/// note: the Wayland xdg_toplevel app_id is derived from the binary name,
/// so the Flatpak installs the binary as moe.sapphic.Chiri to match the .desktop filename for KWin icon lookup
pub fn configure_titlebar_for_de(window: &tauri::WebviewWindow) {
    use gtk::prelude::GtkWindowExt;

    let desktop = env::var("XDG_CURRENT_DESKTOP").unwrap_or_else(|_| "Unknown".to_string());

    if let Ok(gtk_window) = window.gtk_window() {
        if needs_gtk_decorations() {
            log::info!(
                "Desktop '{}' detected - keeping GTK client-side decorations",
                desktop
            );
            return;
        }

        log::info!(
            "Desktop '{}' detected - using native window decorations",
            desktop
        );

        // remove the GTK titlebar to use native DE decorations
        gtk_window.set_titlebar(Option::<&gtk::Widget>::None);
    }
}

#[cfg(not(target_os = "linux"))]
pub fn needs_gtk_decorations() -> bool {
    false
}

#[cfg(not(target_os = "linux"))]
pub fn configure_titlebar_for_de(_window: &tauri::WebviewWindow) {
    // No-op on non-Linux platforms
}
