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
                                     username TEXT    NOT NULL,
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
                                    poi_id        UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    city_id       UUID     REFERENCES cities(city_id),
                                    name          TEXT     NOT NULL,
                                    category      TEXT,
                                    lat           DOUBLE PRECISION,
                                    lon           DOUBLE PRECISION,
                                    opening_hours JSONB,
                                    min_price     NUMERIC(8,2),
                                    max_price     NUMERIC(8,2)
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
                                         plan_id   UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         trip_id   UUID    REFERENCES trips(trip_id),
                                         plan_date DATE    NOT NULL,
                                         max_hours INT     DEFAULT 8
);

-- 7. poi_orders 表：某天要去的 POI 排序
CREATE TABLE IF NOT EXISTS poi_orders (
                                          order_id  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
                                          plan_id   UUID    REFERENCES day_plans(plan_id),
                                          poi_id    UUID    REFERENCES pois(poi_id),
                                          sequence  INT     NOT NULL,
                                          est_start TIME,
                                          est_end   TIME
);

-- 8. authorities 表：存储用户角色
CREATE TABLE IF NOT EXISTS authorities (
                                           id        SERIAL   PRIMARY KEY,
                                           user_id   UUID     NOT NULL REFERENCES users(user_id),
                                           authority TEXT     NOT NULL
);