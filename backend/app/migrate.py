from sqlalchemy import text
from sqlalchemy.engine import Engine


MIGRATION_STATEMENTS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10) DEFAULT '+91'",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS appointment_time VARCHAR(10)",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_type VARCHAR(50)",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS appointment_status VARCHAR(50)",
    "ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time VARCHAR(10)",
    "ALTER TABLE patients ADD COLUMN IF NOT EXISTS alternative_phone VARCHAR(20)",
]


def run_migrations(engine: Engine) -> None:
    with engine.connect() as conn:
        for statement in MIGRATION_STATEMENTS:
            conn.execute(text(statement))
        conn.commit()
