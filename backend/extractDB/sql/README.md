# Database Table Creation

## File Description

- **init_all_tables.sql**: Creates all database tables with proper relationships and constraints

## Usage

1. Execute `init_all_tables.sql` to create the database schema
2. Use the TypeORM migration system or NormalizedJsonSeeder to populate data from JSON files

## Notes

- Only table creation SQL is generated
- Data insertion is handled separately through JSON-based seeding
- Tables are created with proper foreign key relationships
