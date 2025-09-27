-- 確保 UUID 擴展可用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE mask_types (
    mask_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    pack_size INTEGER NOT NULL,
    display_name VARCHAR(255) NOT NULL
);

CREATE TABLE pharmacies (
    pharmacy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    opening_hours VARCHAR(255)
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(18,2) NOT NULL DEFAULT 0
);

CREATE TABLE weekdays (
    weekday_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL,
    short_name VARCHAR(5) NOT NULL
);

CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    mask_type_id UUID NOT NULL REFERENCES mask_types(mask_type_id),
    price DECIMAL(18,2) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE purchase_histories (
    purchase_history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    transaction_amount DECIMAL(18,2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL
);

CREATE TABLE purchase_details (
    purchase_detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_history_id UUID NOT NULL REFERENCES purchase_histories(purchase_history_id),
    mask_type_id UUID NOT NULL REFERENCES mask_types(mask_type_id),
    quantity INTEGER NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    total_price DECIMAL(18,2) NOT NULL
);

CREATE TABLE pharmacy_hours (
    schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(pharmacy_id),
    weekday_id UUID NOT NULL REFERENCES weekdays(weekday_id),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_overnight BOOLEAN NOT NULL DEFAULT FALSE
);

