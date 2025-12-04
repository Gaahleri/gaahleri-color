# Gaahleri Color Store 性能优化文档

## 概述

本文档记录了对 Gaahleri Color Store 网站进行的性能优化措施，主要解决了"每次打开网页获取数据都很慢"的问题。

---

## 优化措施总览

| 优化类型   | 优化内容                        | 预期效果                       |
| ---------- | ------------------------------- | ------------------------------ |
| API 缓存   | 添加 Cache-Control 响应头       | 减少重复请求，利用浏览器缓存   |
| 客户端缓存 | 使用 SWR 替代 useEffect + fetch | 智能缓存、去重请求、后台重验证 |
| 数据库索引 | 添加复合索引优化查询            | 加速数据库查询速度             |

---

## 1. API 层缓存优化

### 已优化的 API 路由

| API 路由                      | Cache-Control 设置                                | 说明                                        |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------- |
| `/api/colors`                 | `public, s-maxage=30, stale-while-revalidate=300` | 公共颜色列表，30 秒缓存，5 分钟过期后仍可用 |
| `/api/series`                 | `public, s-maxage=60, stale-while-revalidate=300` | 系列列表，60 秒缓存                         |
| `/api/admin/series`           | `private, max-age=30, stale-while-revalidate=60`  | 管理员系列数据                              |
| `/api/admin/colors`           | `private, s-maxage=10, stale-while-revalidate=60` | 管理员颜色数据                              |
| `/api/admin/stats/top-colors` | `private, max-age=60, stale-while-revalidate=300` | 统计数据，60 秒缓存                         |
| `/api/user/colors`            | `private, max-age=30, stale-while-revalidate=60`  | 用户收藏颜色                                |
| `/api/user/profile`           | `private, max-age=60, stale-while-revalidate=120` | 用户配置文件                                |
| `/api/recipes`                | `private, max-age=30, stale-while-revalidate=60`  | 用户配方                                    |

### Cache-Control 参数说明

- **public/private**: `public` 可被 CDN 缓存，`private` 仅浏览器缓存
- **max-age**: 缓存新鲜时间（秒）
- **s-maxage**: CDN/代理服务器缓存时间
- **stale-while-revalidate**: 缓存过期后，仍可返回旧数据同时后台更新

---

## 2. 客户端 SWR 缓存优化

### 已安装依赖

```bash
npm install swr
```

### 已优化的组件

| 组件               | 缓存策略                 | dedupingInterval                        |
| ------------------ | ------------------------ | --------------------------------------- |
| `SeriesManagement` | revalidateOnFocus: false | 30 秒                                   |
| `ColorsManagement` | revalidateOnFocus: false | 30 秒 (colors), 60 秒 (series)          |
| `ColorMixer`       | revalidateOnFocus: false | 30 秒 (colors, records), 60 秒 (series) |
| `ColorCollection`  | revalidateOnFocus: false | 30 秒                                   |
| `TopColorsStats`   | revalidateOnFocus: false | 60 秒                                   |
| `MyRecipes`        | revalidateOnFocus: false | 30 秒                                   |
| `CountryInput`     | revalidateOnFocus: false | 60 秒                                   |

### SWR 配置说明

```tsx
const { data, isLoading, mutate } = useSWR<DataType>("/api/endpoint", fetcher, {
  revalidateOnFocus: false, // 切换标签页时不自动重新请求
  dedupingInterval: 30000, // 30秒内相同请求自动去重
});
```

### SWR 优势

1. **请求去重**: 相同 URL 在指定时间内只发送一次请求
2. **数据缓存**: 数据在内存中缓存，页面切换时立即显示
3. **后台重验证**: 显示缓存数据同时后台静默更新
4. **乐观更新**: 使用 `mutate()` 立即更新 UI，无需等待服务器响应
5. **错误处理**: 自动重试失败请求

### Fetcher 工具函数

创建了 `/lib/fetcher.ts`:

```typescript
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json();
};
```

---

## 3. 数据库索引优化

### 新增索引

| 模型         | 索引                            | 用途                 |
| ------------ | ------------------------------- | -------------------- |
| `Color`      | `@@index([hex])`                | 加速按颜色值查询     |
| `UserRecord` | `@@index([userId, isFavorite])` | 加速收藏颜色查询     |
| `Recipe`     | `@@index([userId, createdAt])`  | 加速用户配方时间排序 |

### 应用索引

运行以下命令应用数据库更改：

```bash
npx prisma migrate dev --name add_performance_indexes
```

---

## 4. 性能对比

### 优化前

- 每次页面访问都发送 API 请求
- 页面切换后数据需要重新加载
- 多个组件重复请求相同数据
- 用户操作后需等待服务器响应才更新 UI

### 优化后

- 缓存有效期内直接使用缓存数据
- 页面切换立即显示已缓存数据
- SWR 自动去重相同请求
- 乐观更新立即反馈用户操作

---

## 5. 后续优化建议

### 短期优化

1. **图片优化**: 使用 Next.js Image 组件进行图片优化
2. **代码分割**: 使用 dynamic import 延迟加载非关键组件
3. **预加载**: 使用 SWR 的 `preload` 功能预加载常用数据

### 中期优化

1. **边缘缓存**: 部署到 Vercel 时启用边缘缓存
2. **ISR**: 对静态内容使用增量静态再生
3. **数据库连接池**: 配置 Prisma 连接池优化

### 长期优化

1. **Redis 缓存**: 引入 Redis 作为服务端缓存层
2. **CDN**: 配置 CDN 加速静态资源
3. **数据库读写分离**: 大规模时考虑读写分离

---

## 6. 监控与调试

### 性能监控

可以使用以下工具监控性能：

1. **浏览器 DevTools - Network**: 查看请求是否使用缓存
2. **Lighthouse**: 整体性能评分
3. **Vercel Analytics**: 部署后的性能分析

### SWR DevTools

安装 SWR DevTools 浏览器扩展查看缓存状态：

```bash
# Chrome/Firefox 扩展: SWR DevTools
```

---

## 更新日志

| 日期       | 更新内容                                     |
| ---------- | -------------------------------------------- |
| 2024-12-04 | 初始性能优化：API 缓存、SWR 集成、数据库索引 |

---

## 相关文件

- `/lib/fetcher.ts` - SWR fetcher 函数
- `/app/api/*/route.ts` - API 路由缓存配置
- `/prisma/schema.prisma` - 数据库索引配置
- `/components/**/*.tsx` - SWR 集成组件
