
# TravelPlanner 项目启动指南

## 一、前置条件

1. **Docker & Docker Compose**
2. **Java 17 SDK**
3. IntelliJ IDEA（或其他支持 Java 的 IDE）

## 二、启动步骤

### 0. 环境要求

* 本地需安装 **Java JDK 17+**（推荐使用 JDK 21）。

    * IntelliJ -> **Project Structure → SDK** 选你安装的 JDK。
    * **Language level** 设为与 toolchain 一致（17 或 21）。
* Docker 和 Docker Compose 应安装：用于启动 PostgreSQL 容器。
* IDE（可选）：IntelliJ IDEA，已安装 Gradle 插件。

### 1. 启动数据库（Docker Compose）

在项目根目录下，通过命令行执行：

```bash
docker-compose up -d
```

或者在本机的 **Docker Desktop**（或 **Docker** 应用）里，打开 **travel-plan-db** 服务，点击旁边的 **Start** 按钮启动。

* 容器名：`travel-plan-db`
* Postgres 映射到本机端口：`5434` → 容器内 `5432`
* 数据库：`travel_plan`
* 用户名：`postgres`
* 密码：`secret123`

### 2. 导入建表脚本 导入建表脚本

`docker/database-init.sql` 会在容器启动时自动执行，无需手动操作。

### 3. 运行后端服务

1. 在 IntelliJ 项目视图中定位到：


src/main/java/com/laioffer/travelplanner/TravelPlannerApplication.java

````
2. 点击类文件上方的绿色 ▶️ **Run ‘TravelPlannerApplication’** 按钮
3. 应用默认启动在 `http://localhost:8080`

### 4. 数据源配置

已在 `application.yml` 中配置：
```yaml
spring:
datasource:
 url: jdbc:postgresql://localhost:5434/travel_plan
 username: postgres
 password: secret123
 driver-class-name: org.postgresql.Driver

server:
port: 8080
````

如需修改端口或凭据，可直接编辑该文件或使用环境变量覆盖。

## 三、Postman 测试脚本
（signin,signup,logout）apis

导入下面 JSON 到 Postman：

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
          "path": ["api","user","register"]
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
          "path": ["api","user","login"]
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
          "path": ["api","users"]
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
          "path": ["api","user","logout"]
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

导入后即可依次执行：

1. Register User  → 应返回 200
2. Login User     → 返回 200，并自动保存 `JSESSIONID`
3. Get All Users  → 返回 200 + 用户列表
4. Logout User    → 返回 200

---

>>>>>>> origin/backend-murphy
