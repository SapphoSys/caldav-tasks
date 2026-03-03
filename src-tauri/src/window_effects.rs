// Taken from https://github.com/damien-schneider/echo/blob/main/src-tauri/src/window_effects.rs

use tauri::WebviewWindow;

/// Apply the platform-specific appearance tweaks (vibrancy/liquid glass/blur) to the
/// provided window.
pub fn apply_window_effects(window: &WebviewWindow) {
    #[cfg(target_os = "macos")]
    {
        apply_macos_window_effects(window);
    }

    #[cfg(target_os = "linux")]
    {
        apply_linux_window_effects(window);
    }

    #[cfg(target_os = "windows")]
    {
        apply_windows_window_effects(window);
    }
}

#[cfg(target_os = "macos")]
fn apply_macos_window_effects(window: &WebviewWindow) {
    if let Err(vibrancy_error) = apply_vibrancy_effect(window) {
        log::warn!("Failed to apply vibrancy effect: {:?}", vibrancy_error);
    }
}

#[cfg(target_os = "macos")]
fn apply_vibrancy_effect(window: &WebviewWindow) -> Result<(), window_vibrancy::Error> {
    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

    apply_vibrancy(window, NSVisualEffectMaterial::HudWindow, None, None)
}

#[cfg(target_os = "linux")]
fn apply_linux_window_effects(window: &WebviewWindow) {
    // On Linux/GTK3, achieving true window transparency requires THREE things
    // that Tauri's `transparent: true` config alone does not reliably provide
    // (especially with decorations: false):
    //
    //   1. RGBA visual — so the window surface supports an alpha channel.
    //   2. app_paintable(true) — tells GTK to NOT draw its own opaque
    //      background, delegating ALL rendering to the application.
    //   3. GTK CSS override — the Adwaita theme still sets background-color
    //      on the window widget and its children; we force it to transparent.
    //
    // Without all three, the native GTK window retains an opaque white/gray
    // background behind the webview. This is visible:
    //   - As a faint horizontal bar at the top of the window
    //   - As artifacts in the rounded corners (CSS border-radius clips the
    //     webview content but the GTK background remains rectangular)
    //   - Most visible on light themes / HDR displays
    //
    // The diagnostic test (adding a 32px margin in GlassWindow) confirmed that
    // the entire native window background was opaque, proving the transparency
    // pipeline was broken at the GTK level, not in CSS.

    use gtk::prelude::*;

    let gtk_window = match window.gtk_window() {
        Ok(w) => w,
        Err(e) => {
            log::warn!("Failed to get GTK window for transparency fix: {:?}", e);
            return;
        }
    };

    // 1. Ensure the window has an RGBA visual (alpha channel support)
    if let Some(screen) = WidgetExt::screen(&gtk_window) {
        if let Some(visual) = screen.rgba_visual() {
            gtk_window.set_visual(Some(&visual));
            log::info!("Linux window: Set RGBA visual for transparency");
        } else {
            log::warn!("Linux window: No RGBA visual available — transparency will not work");
        }
    }

    // 2. Tell GTK not to draw its own background (delegate to the app/webview)
    gtk_window.set_app_paintable(true);

    // 3. Neutralize tao's Wayland headerbar.
    //
    //    tao (Tauri's windowing library) has a Wayland-specific code path in
    //    `platform_impl/linux/wayland/header.rs` that ALWAYS creates a
    //    GtkHeaderBar wrapped in an EventBox and calls
    //    `window.set_titlebar(Some(&event_box))`, regardless of the
    //    `decorations: false` setting. This headerbar's bottom border/separator
    //    renders as a faint 1px horizontal bar at the top of the window.
    //
    //    We hide the existing titlebar and replace it with a zero-height widget.
    if let Some(titlebar) = gtk_window.titlebar() {
        titlebar.hide();
        titlebar.set_size_request(0, 0);
        log::info!(
            "Linux window: Hidden tao's Wayland headerbar widget (type: {})",
            titlebar.type_().name()
        );
    } else {
        log::info!("Linux window: No titlebar widget found");
    }
    let empty = gtk::Box::new(gtk::Orientation::Horizontal, 0);
    empty.set_size_request(0, 0);
    empty.set_no_show_all(true);
    gtk_window.set_titlebar(Some(&empty));

    // 4. Override GTK theme on the window, CSD decoration node, headerbar,
    //    eventbox, separators, and any CSD-related classes.
    //
    //    The `decoration` node handles the compositor-level shadow and border.
    //    Even with decorations: false, GTK may still render it.
    //
    //    We also target `window.csd` and `window.solid-csd` (CSD window
    //    classes used by GTK when set_titlebar has been called), as well as
    //    `separator` widgets and `menubar` which tao/GTK may inject.
    //
    //    We use STYLE_PROVIDER_PRIORITY_USER (highest) to ensure our
    //    overrides take precedence over all theme rules.
    let css_provider = gtk::CssProvider::new();
    if let Err(e) = css_provider.load_from_data(
        b"\
        window, window * { background-color: transparent; border: none; box-shadow: none; }\n\
        window.csd { margin: 0; padding: 0; border: none; box-shadow: none; border-radius: 0; }\n\
        window.solid-csd, window.solid-csd:backdrop { margin: 0; padding: 0; border: none; box-shadow: none; border-radius: 0; }\n\
        decoration, decoration:backdrop { box-shadow: none; margin: 0; padding: 0; border: none; background-color: transparent; }\n\
        headerbar, headerbar:backdrop { min-height: 0; padding: 0; margin: 0; border: none; box-shadow: none; background-color: transparent; opacity: 0; }\n\
        eventbox { min-height: 0; padding: 0; margin: 0; background-color: transparent; }\n\
        separator { min-height: 0; min-width: 0; background-color: transparent; border: none; padding: 0; margin: 0; }\n\
        menubar { min-height: 0; padding: 0; margin: 0; border: none; box-shadow: none; background-color: transparent; }\n\
        ",
    ) {
        log::warn!("Failed to load GTK transparency CSS: {:?}", e);
        return;
    }

    // Apply globally via the screen at USER priority (highest) so our
    // overrides take precedence over all theme rules, including for
    // the decoration node (which is outside the widget hierarchy, so
    // add_provider on the window's style_context does not reach it).
    if let Some(screen) = WidgetExt::screen(&gtk_window) {
        gtk::StyleContext::add_provider_for_screen(
            &screen,
            &css_provider,
            gtk::STYLE_PROVIDER_PRIORITY_USER,
        );
    }

    log::info!("Linux window: Transparency pipeline configured (RGBA visual + app_paintable + decoration CSS override)");
}

#[cfg(target_os = "windows")]
fn apply_windows_window_effects(window: &WebviewWindow) {
    use window_vibrancy::apply_mica;

    // Try Mica effect first (Windows 11)
    if let Err(e) = apply_mica(window, None) {
        log::warn!("Mica effect not available (requires Windows 11): {:?}", e);

        // Fallback to acrylic for Windows 10
        use window_vibrancy::apply_acrylic;
        if let Err(e) = apply_acrylic(window, Some((0, 0, 0, 100))) {
            log::warn!("Acrylic effect also failed: {:?}", e);
        }
    }
}
