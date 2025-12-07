# Admin Status 界面筛选功能

## 更新内容

为 Admin 的 Status（Top Colors）界面添加了与 Purchase 界面一致的筛选功能。

### 1. 新增功能

#### 时间筛选

- 支持按月份筛选数据
- 默认显示当前月份
- 提供最近 12 个月的选项
- 月份格式：`January 2024`, `February 2024` 等

#### 国家/地区筛选

- 支持按国家筛选数据
- 默认显示所有国家 (`All Countries`)
- 国家数据来自 Vercel 的 `x-vercel-ip-country` header
- 自动列出有数据的国家

### 2. 修改的文件

#### 前端组件

**`components/admin/top-colors-stats.tsx`**

- 添加了 `selectedYear` 和 `selectedMonth` 状态
- 添加了时间筛选下拉菜单
- 更新 API 调用以包含年份和月份参数
- 更新标题和描述文案

#### 后端 API

**`app/api/admin/stats/top-colors/route.ts`**

- 添加 `year` 和 `month` 查询参数支持
- 修改日期查询逻辑为按月份筛选
- 计算指定月份的开始和结束日期
- 返回该月份内的 Top 10 颜色

#### 数据库优化

**`prisma/schema.prisma`**

- 为 `User` 表的 `country` 字段添加索引
- 提升按国家筛选的查询性能

### 3. 使用方法

1. 访问 Admin 页面
2. 切换到 "Status" 标签
3. 使用右上角的两个下拉菜单：
   - **国家选择器**：筛选特定国家的用户数据
   - **月份选择器**：查看特定月份的统计数据

### 4. API 参数

```typescript
GET /api/admin/stats/top-colors?year=2024&month=12&country=US

// 参数说明：
// - year: 年份（默认当前年）
// - month: 月份 1-12（默认当前月）
// - country: 国家代码或 "all"（默认 "all"）

// 返回数据：
{
  topColors: [
    {
      id: string,
      name: string,
      hex: string,
      rgb: string,
      series: { name: string },
      addCount: number  // 该月份被保存的次数
    }
  ],
  availableCountries: string[]  // 有数据的国家列表
}
```

### 5. 数据来源

- **用户国家**：通过 Vercel 的 `x-vercel-ip-country` header 自动检测
- **保存时间**：`UserRecord.createdAt` 字段
- **统计范围**：选定月份的第一天 00:00 到最后一天 23:59

### 6. 注意事项

- 本地开发环境可能无法检测国家（返回 null）
- Vercel 部署后会自动获取用户国家信息
- 历史数据的用户如果没有 country 信息，会被归类到 "未知"
- 索引已添加到数据库，查询性能已优化

### 7. 测试建议

1. **测试不同月份**：切换月份查看历史数据
2. **测试国家筛选**：如果有多国用户数据，测试筛选功能
3. **测试空数据**：选择没有数据的月份，应显示友好的空状态
4. **测试性能**：即使有大量数据，查询也应该很快（有索引）

### 8. 界面截图示意

```
+----------------------------------------------------------+
| Top 10 Most Saved Colors                    [US ▼] [Dec 2024 ▼] |
| Most saved colors by users for selected month          |
+----------------------------------------------------------+
| #1  [色块] Color Name      Series Badge    123 saves    |
| #2  [色块] Color Name      Series Badge     98 saves    |
| ...                                                      |
+----------------------------------------------------------+
```

---

## 实现细节

### 月份选项生成

```typescript
// 生成最近 12 个月的选项
const monthOptions: { value: string; label: string }[] = [];
for (let i = 0; i < 12; i++) {
  const date = new Date(currentYear, currentMonth - 1 - i, 1);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  monthOptions.push({
    value: `${year}-${month}`,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
  });
}
```

### 日期范围计算

```typescript
// 月份第一天和最后一天
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0, 23, 59, 59, 999);

// Prisma 查询
createdAt: {
  gte: startDate,
  lte: endDate,
}
```

### 国家筛选

```typescript
// 仅当选择了特定国家时添加筛选条件
if (country && country !== "all") {
  whereClause.user = {
    country: country,
  };
}
```
