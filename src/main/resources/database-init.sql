-- 0. 如果存在旧的表，先删掉（按依赖关系顺序）
DROP TABLE IF EXISTS poi_orders;
DROP TABLE IF EXISTS route;
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
CREATE TABLE IF NOT EXISTS users
(
    user_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT,
    email    TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    enabled  BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. cities 表：存城市
CREATE TABLE IF NOT EXISTS cities
(
    city_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name    TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    lat     DOUBLE PRECISION,
    lon     DOUBLE PRECISION
);

-- 4. pois 表：存景点/酒店/餐厅等
CREATE TABLE IF NOT EXISTS pois
(
    poi_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id            UUID             NOT NULL REFERENCES cities (city_id),
    place_id           TEXT UNIQUE      NOT NULL,
    name               TEXT             NOT NULL,
    formatted_address  TEXT             NOT NULL,
    types              TEXT,
    lat                DOUBLE PRECISION NOT NULL,
    lng                DOUBLE PRECISION NOT NULL,
    opening_hours      TEXT,
    rating             NUMERIC(2, 1),
    user_ratings_total INT,
    photo_reference    TEXT
);

-- 5. trips 表：用户行程
CREATE TABLE IF NOT EXISTS trips
(
    trip_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users (user_id),
    city_id    UUID NOT NULL REFERENCES cities (city_id),
    start_date DATE NOT NULL,
    days       INT  NOT NULL CHECK (days BETWEEN 1 AND 15)
);

-- 6. day_plans 表：某行程每天计划
CREATE TABLE IF NOT EXISTS day_plans
(
    plan_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id    UUID NOT NULL REFERENCES trips (trip_id),
    plan_date       DATE NOT NULL,
    day_number INT  NOT NULL

);

-- 7. poi_orders 表：某天要去的 POI 排序
CREATE TABLE IF NOT EXISTS route
(
    route_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id     UUID NOT NULL REFERENCES day_plans (plan_id),
    poi_id      UUID NOT NULL REFERENCES pois (poi_id),
    visit_order INT  NOT NULL
);

-- 8. authorities 表：存储用户角色
CREATE TABLE IF NOT EXISTS authorities
(
    id        SERIAL PRIMARY KEY,
    user_id   UUID NOT NULL REFERENCES users (user_id),
    authority TEXT NOT NULL
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
INSERT INTO users (user_id,
                   username,
                   email,
                   password,
                   enabled)
VALUES ('6463a975-04f8-4810-abd1-c700beb32ef4',
        '123456789',
        'c@mail.com',
        '{bcrypt}$2a$10$gMcMNG2BZRMWCTH2ars2yO1qRJVgEWmKIb8xt4LTKFeyX9CHD0jma',
        true);

INSERT INTO trips (trip_id, user_id, city_id, start_date, days)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6463a975-04f8-4810-abd1-c700beb32ef4',
        '6ba7b814-9dad-11d1-80b4-00c04fd430c8', '2025-05-15', 7),
       ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '6463a975-04f8-4810-abd1-c700beb32ef4',
        '6ba7b814-9dad-11d1-80b4-00c04fd430c8', '2025-09-01', 5);
INSERT INTO pois (poi_id,
                  city_id,
                  place_id,
                  name,
                  formatted_address,
                  types,
                  lat,
                  lng,
                  opening_hours,
                  rating,
                  user_ratings_total,
                  photo_reference)
VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
        'ChIJV4FfHcUAhYARmj9VW2_yWrA',
        'Golden Gate Bridge',
        'Golden Gate Bridge, San Francisco, CA 94129, USA',
        '{
          "point_of_interest",
          "bridge",
          "landmark"
        }',
        37.8199,
        -122.4783,
        '{
          "open_now": true,
          "periods": [],
          "weekday_text": [
            "Open 24 hours"
          ]
        }',
        4.8,
        45000,
        'CnRtAAAATLZNl354RwP_...'),
       ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
        'ChIJddXQJIsAhYARsUBW5qZGqX0',
        'Alcatraz Island',
        'Alcatraz Island, San Francisco, CA 94133, USA',
        '{
          "point_of_interest",
          "establishment",
          "tourist_attraction"
        }',
        37.8267,
        -122.4233,
        '{
          "open_now": false,
          "periods": [],
          "weekday_text": [
            "Monday: 9:00 AM – 6:30 PM"
          ]
        }',
        4.7,
        32000,
        'CnRtAAAATLZNl354RwP_...')
ON CONFLICT (poi_id) DO NOTHING;
INSERT INTO day_plans (plan_id, trip_id, plan_date, day_number)
VALUES ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025-07-01', 1),
       ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025-07-02', 2),
       ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a66','a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025-07-03', 3);

-- For European Adventure (16 days)
INSERT INTO day_plans (plan_id,trip_id, plan_date, day_number)
VALUES ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '2025-08-15', 1),
       ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33','b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '2025-08-16', 2);
INSERT INTO route (route_id,plan_id, poi_id, visit_order)
VALUES
    -- Day 1 itinerary
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479','d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 1), -- Eiffel Tower first
    ('9c4f1b2d-3a8e-4f5c-bd12-6e901a345c67','d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 2), -- Louvre second

    -- Day 2 itinerary
    ('2e8a3d0f-1b9c-4e5d-a8f3-7d6c4b5a9e81','d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 1);