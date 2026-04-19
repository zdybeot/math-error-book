# 腾讯云云函数部署

## 方式一：控制台手动部署（推荐）

1. 登录 https://console.cloud.tencent.com/scf
2. 点击 **函数服务** → **新建**
   - 地域：选择离你最近的（如广州）
   - 函数名称：`math-error-book-ai`
   - 运行环境：`Nodejs 20.17`
   - 提交方式：**本地上传 zip 包**
3. 上传代码：在项目根目录执行
   ```bash
   cd server
   rm -rf node_modules
   npm install --production
   zip -r ../server.zip . -x "*.env" "node_modules/.cache/*"
   ```
   将生成的 `server.zip` 上传
4. 点击 **高级配置** → 环境变量，添加：
   - `AI_API_KEY` = `sk-67a3d3b5c25347eeb5419a7bcf0f9ca4`
   - `AI_MODEL` = `qwen3.5-omni-flash`
   - `AI_BASE_URL` = `https://dashscope.aliyuncs.com/compatible-mode/v1`
5. 内存：512MB，超时时间：60 秒
6. 点击 **完成** → 部署

### 配置 API 网关触发器

1. 进入函数详情 → **触发器管理** → **创建触发器**
2. 触发方式：**API 网关触发器**
3. 集成 API 网关：选择 **创建新的 API 网关**
4. 环境：选择 **release**
5. 鉴权方法：**免鉴权**（因为是内部服务）
6. 创建后复制 **访问路径**（类似 `https://service-xxx.gz.apigw.tencentcs.com`）

## 方式二：Serverless Framework 部署（自动化）

```bash
npm install -g serverless
serverless deploy
```

## 更新客户端 API 地址

将复制到的 API 网关地址填入 `src/config/api.ts`：

```typescript
export const API_BASE_URL = 'https://service-xxx.gz.apigw.tencentcs.com';
```
