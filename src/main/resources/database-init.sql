-- 0. 如果存在旧的表，先删掉（按依赖关系顺序）
DROP TABLE IF EXISTS poi_orders;
DROP TABLE IF EXISTS day_plans;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS pois;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS users;

-- 1. 启用 uuid 生成扩展
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. users 表：存注册用户
CREATE TABLE IF NOT EXISTS users (
                                     user_id  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     username TEXT,
                                     email    TEXT    NOT NULL UNIQUE,
                                     password TEXT    NOT NULL,
                                     enabled  BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. cities 表：存城市
CREATE TABLE IF NOT EXISTS cities (
                                      city_id UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
                                      name    TEXT               NOT NULL,
                                      country TEXT               NOT NULL,
                                      lat     DOUBLE PRECISION,
                                      lon     DOUBLE PRECISION
);

-- 4. pois 表：存景点/酒店/餐厅等
CREATE TABLE IF NOT EXISTS pois (
                                    poi_id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    city_id             UUID                NOT NULL REFERENCES cities(city_id),
                                    place_id            TEXT                UNIQUE NOT NULL,
                                    name                TEXT                NOT NULL,
                                    formatted_address   TEXT                NOT NULL,
                                    types               JSONB
                                    lat                 DOUBLE PRECISION    NOT NULL,
                                    lng                 DOUBLE PRECISION    NOT NULL,
                                    opening_hours       JSONB,
                                    rating              NUMERIC(2,1),
                                    user_ratings_total  INT,
                                    photo_reference     TEXT
);

-- 5. trips 表：用户行程
CREATE TABLE IF NOT EXISTS trips (
                                     trip_id    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     user_id    UUID    NOT NULL REFERENCES users(user_id),
                                     city_id    UUID    NOT NULL REFERENCES cities(city_id),
                                     start_date DATE    NOT NULL,
                                     days       INT     NOT NULL CHECK (days BETWEEN 1 AND 15)
);

-- 6. day_plans 表：某行程每天计划
CREATE TABLE IF NOT EXISTS day_plans (
                                         plan_id    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         trip_id    UUID    REFERENCES trips(trip_id),
                                         plan_date  DATE    NOT NULL,
                                         day_number INT     NOT NULL,

);

-- 7. poi_orders 表：某天要去的 POI 排序
CREATE TABLE IF NOT EXISTS route (
                                          route_id      UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                          plan_id       UUID    NOT NULL REFERENCES day_plans(plan_id),
                                          poi_id        UUID    NOT NULL REFERENCES pois(poi_id),
                                          visit_order   INT     NOT NULL,
);

-- 8. authorities 表：存储用户角色
CREATE TABLE IF NOT EXISTS authorities (
                                           id        SERIAL   PRIMARY KEY,
                                           user_id   UUID     NOT NULL REFERENCES users(user_id),
                                           authority TEXT     NOT NULL
);

-- Insert sample cities with fixed UUIDs for development consistency
INSERT INTO cities (city_id, name, country, lat, lon)
VALUES
    -- Paris, France
    ('f47ac10b-58cc-4372-a567-0e02b2c3d478', 'Paris', 'France', 48.8566, 2.3522),

    -- Tokyo, Japan
    ('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', 'Tokyo', 'Japan', 35.6762, 139.6503),

    -- New York, USA
    ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'New York', 'USA', 40.7128, -74.0060),

    -- London, UK
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'London', 'UK', 51.5074, -0.1278),

    -- Sydney, Australia
    ('550e8400-e29b-41d4-a716-446655440000', 'Sydney', 'Australia', -33.8688, 151.2093),

    -- Berlin, Germany
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Berlin', 'Germany', 52.5200, 13.4050),

    -- Rome, Italy
    ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Rome', 'Italy', 41.9028, 12.4964),

    -- Beijing, China
    ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Beijing', 'China', 39.9042, 116.4074),

    -- Rio de Janeiro, Brazil
    ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'Rio de Janeiro', 'Brazil', -22.9068, -43.1729),

    -- Cape Town, South Africa
    ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', 'Cape Town', 'South Africa', -33.9249, 18.4241)
ON CONFLICT (city_id) DO NOTHING;