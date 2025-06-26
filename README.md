
# TravelPlanner 项目启动指南

## 一、前置条件

1. 安装 **Java JDK 17+**（推荐 JDK 21）
2. 安装 **Docker & Docker Compose**
3. 使用 IDE（推荐 IntelliJ IDEA，需安装 Gradle 插件）

---

## 二、项目启动步骤

### 0. 环境要求

- IntelliJ → `Project Structure → SDK`：选择你安装的 JDK（17/21）
- `Language level` 设置为 JDK 对应版本
- Docker 启动并可用（建议使用 Docker Desktop）

---

### 1. 启动数据库服务

在项目根目录执行以下命令：

```bash
docker-compose up -d
```

或在 Docker Desktop 中手动启动 `travel-plan-db` 服务。

数据库容器配置如下：

| 项目         | 值               |
|--------------|------------------|
| 容器名       | travel-plan-db    |
| 映射端口     | 本地 5434 → 容器 5432 |
| 数据库名     | travel_plan       |
| 用户名       | postgres          |
| 密码         | secret123         |

---

### 2. 自动执行建表脚本

`docker/database-init.sql` 会在容器首次启动时自动执行，自动完成建表，无需手动导入。

---

### 3. 启动后端服务

1. 打开类：
   ```
   src/main/java/com/laioffer/travelplanner/TravelPlannerApplication.java
   ```
2. 点击类顶部的绿色 ▶️ 图标运行项目
3. 启动成功后，服务运行在：
   ```
   http://localhost:8080
   ```

---

### 4. 数据源配置

默认配置已在 `application.yml` 中设置：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/travel_plan
    username: postgres
    password: secret123
    driver-class-name: org.postgresql.Driver

server:
  port: 8080
```

如需修改端口或数据库配置，可直接修改该文件。

---

## 三、Postman 测试脚本
**(User APIs）

导入以下 JSON 到 Postman：

<details>
<summary>点击展开 JSON</summary>

```json
{
  "info": {
    "name": "TravelPlanner User APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"traveler2025\",\n  \"email\": \"traveler@example.com\",\n  \"password\": \"secret123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/user/register",
          "host": ["{{baseUrl}}"],
          "path": ["api", "user", "register"]
        }
      }
    },
    {
      "name": "Login User",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/x-www-form-urlencoded" }
        ],
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            { "key": "username", "value": "traveler@example.com", "type": "text" },
            { "key": "password", "value": "secret123", "type": "text" }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/api/user/login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "user", "login"]
        }
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/users",
          "host": ["{{baseUrl}}"],
          "path": ["api", "users"]
        }
      }
    },
    {
      "name": "Logout User",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Cookie", "value": "JSESSIONID={{JSESSIONID}}" }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/user/logout",
          "host": ["{{baseUrl}}"],
          "path": ["api", "user", "logout"]
        }
      }
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" },
    { "key": "JSESSIONID", "value": "" }
  ]
}
```
</details>

导入后依次执行：

1.  **Register User** → 注册新用户
2.  **Login User** → 登录获取 `JSESSIONID`（自动保存）
3.  **Get All Users** → 获取所有注册用户
4.  **Logout User** → 注销登录

**（Trip APIs）

导入以下 JSON 到 Postman：

<details>
<summary>点击展开 JSON</summary>

```json
{
  "info": {
    "name": "TravelPlanner Trip APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Trip",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Cookie", "value": "JSESSIONID={{JSESSIONID}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"cityId\": \"f47ac10b-58cc-4372-a567-0e02b2c3d478\",\n  \"startDate\": \"2025-07-01\",\n  \"days\": 5\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/trips",
          "host": ["{{baseUrl}}"],
          "path": ["api", "trips"]
        }
      }
    },
    {
      "name": "Get My Trips",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Cookie", "value": "JSESSIONID={{JSESSIONID}}" }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/trips",
          "host": ["{{baseUrl}}"],
          "path": ["api", "trips"]
        }
      }
    },
    {
      "name": "Get Trip by ID",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Cookie", "value": "JSESSIONID={{JSESSIONID}}" }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/trips/{{tripId}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "trips", "{{tripId}}"]
        }
      }
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" },
    { "key": "JSESSIONID", "value": "" },
    { "key": "tripId", "value": "REPLACE_WITH_TRIP_ID" }
  ]
}
```
</details>

导入后依次执行：

1.  **Create Trip**
  - Body 中填写城市 ID（如 Paris: `f47ac10b-58cc-4372-a567-0e02b2c3d478`）、开始日期和天数
2.  **Get My Trips**
  - 获取当前登录用户的所有行程
3.  **Get Trip by ID**
  - 替换 `tripId` 参数为上一步返回中的某个 ID

---

