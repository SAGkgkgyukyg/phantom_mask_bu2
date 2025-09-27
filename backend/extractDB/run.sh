#!/bin/bash

set -e

echo "Starting data export..."

# Delete the sql directory if it exists
rm -rf ./sql

# Run extract_sql.py
python3 extract_sql.py

echo "Data export completed."