import os
import json
from datetime import datetime

tables_in_order = [
    "mask_types",
    "pharmacies",
    "users",
    "weekdays",
    "inventory",
    "purchase_histories",
    "purchase_details",
    "pharmacy_hours"
]

tables = {
    "mask_types": """
CREATE TABLE mask_types (
    mask_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    pack_size INTEGER NOT NULL,
    display_name VARCHAR(255) NOT NULL
);
""",
    "pharmacies": """
CREATE TABLE pharmacies (
    pharmacy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    opening_hours VARCHAR(255)
);
""",
    "users": """
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(18,2) NOT NULL DEFAULT 0
);
""",
    "weekdays": """
CREATE TABLE weekdays (
    weekday_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL,
    short_name VARCHAR(5) NOT NULL
);
""",
    "inventory": """
CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    mask_type_id UUID NOT NULL REFERENCES mask_types(mask_type_id),
    price DECIMAL(18,2) NOT NULL,
    quantity INTEGER NOT NULL
);
""",
    "purchase_histories": """
CREATE TABLE purchase_histories (
    purchase_history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    transaction_amount DECIMAL(18,2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL
);
""",
    "purchase_details": """
CREATE TABLE purchase_details (
    purchase_detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_history_id UUID NOT NULL REFERENCES purchase_histories(purchase_history_id),
    mask_type_id UUID NOT NULL REFERENCES mask_types(mask_type_id),
    quantity INTEGER NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    total_price DECIMAL(18,2) NOT NULL
);
""",
    "pharmacy_hours": """
CREATE TABLE pharmacy_hours (
    schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    weekday_id UUID NOT NULL REFERENCES weekdays(weekday_id),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_overnight BOOLEAN NOT NULL DEFAULT FALSE
);
"""
}

output_dir = os.path.join(os.path.dirname(__file__), "sql")
os.makedirs(output_dir, exist_ok=True)

# Generate table creation SQL
output_file = os.path.join(output_dir, "init_all_tables.sql")
with open(output_file, "w", encoding="utf-8") as f:
    for table in tables_in_order:
        f.write(tables[table].strip() + "\n\n")

# Generate INSERT SQL files from JSON data


def load_json_data(filename):
    """Load JSON data from normalized directory"""
    json_file = os.path.join(os.path.dirname(__file__), "normalized", filename)
    with open(json_file, "r", encoding="utf-8") as f:
        return json.load(f)




print("✅ Table creation SQL file generated successfully!")
print(f"📁 File saved to: {output_dir}")
print("📋 Generated files:")
print(f"   - init_all_tables.sql")

# 簡化的 README 內容
readme_content = """# Database Table Creation

## File Description

- **init_all_tables.sql**: Creates all database tables with proper relationships and constraints

## Usage

1. Execute `init_all_tables.sql` to create the database schema
2. Use the TypeORM migration system or NormalizedJsonSeeder to populate data from JSON files

## Notes

- Only table creation SQL is generated
- Data insertion is handled separately through JSON-based seeding
- Tables are created with proper foreign key relationships
"""

with open(os.path.join(output_dir, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

print("📄 Simplified README.md generated")
