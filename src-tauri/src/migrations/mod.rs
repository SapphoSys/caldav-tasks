mod v001_initial_tables;
mod v002_nullable_account_calendar;
mod v003_add_url_field;
mod v004_add_emoji_field;
mod v005_add_show_unstarted;
mod v006_remove_subtasks_column;
mod v007_task_history;
mod v008_task_status;

use tauri_plugin_sql::Migration;

pub use v001_initial_tables::migration as migration_v001;
pub use v002_nullable_account_calendar::migration as migration_v002;
pub use v003_add_url_field::migration as migration_v003;
pub use v004_add_emoji_field::migration as migration_v004;
pub use v005_add_show_unstarted::migration as migration_v005;
pub use v006_remove_subtasks_column::migration as migration_v006;
pub use v007_task_history::migration as migration_v007;
pub use v008_task_status::migration as migration_v008;

/// Returns all database migrations for the application
pub fn get_migrations() -> Vec<Migration> {
    vec![
        migration_v001(),
        migration_v002(),
        migration_v003(),
        migration_v004(),
        migration_v005(),
        migration_v006(),
        migration_v007(),
        migration_v008(),
    ]
}
