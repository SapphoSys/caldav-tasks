use tauri_plugin_sql::{Migration, MigrationKind};

/// Adds sort_order field to tags table
/// Allows users to manually reorder tags in the sidebar
pub fn migration() -> Migration {
    Migration {
        version: 11,
        description: "add_sort_order_to_tags",
        sql: r#"
            ALTER TABLE tags ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
        "#,
        kind: MigrationKind::Up,
    }
}
