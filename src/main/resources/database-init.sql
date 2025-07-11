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
    days       INT  NOT NULL CHECK (days BETWEEN 1 AND 15),
    name       TEXT
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
