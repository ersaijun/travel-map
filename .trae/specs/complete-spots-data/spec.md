# 完善景区数据信息 Spec

## Why
当前数据库中有338个景区，但只有54个热门景区有完整的详细信息（描述、亮点、门票、开放时间、评分、图片）。其余284个景区缺少这些关键信息，影响用户体验和数据展示效果。

## What Changes
- 补充所有338个景区的完整详细信息
- 数据字段包括：description（描述）、highlights（亮点）、ticketInfo（门票信息）、openTime（开放时间）、rating（评分）、images（图片）
- 更新数据库中的景区记录

## Impact
- Affected specs: 景区数据模型、景区详情展示
- Affected code: `data/scenic-spots-detail.json`、`backend/src/scripts/importSpotDetails.ts`

## ADDED Requirements

### Requirement: 景区详细信息完整性
系统 SHALL 为所有338个5A级景区提供完整的详细信息。

#### Scenario: 查看任意景区详情
- **WHEN** 用户点击地图上的景区标记或搜索景区
- **THEN** 系统应显示该景区的完整信息（描述、亮点、门票、开放时间、评分）

### Requirement: 数据字段规范
每个景区 SHALL 包含以下字段：
- `description`: 100-300字的景区介绍
- `highlights`: 3-5个特色亮点标签
- `ticketInfo.price`: 门票价格（数字，0表示免费）
- `ticketInfo.description`: 门票详细说明
- `openTime`: 开放时间描述
- `rating`: 评分（4.0-5.0之间）
- `images`: 图片URL数组（至少1张，可为空数组）

## MODIFIED Requirements

### Requirement: 数据导入脚本
现有导入脚本 SHALL 支持批量更新所有景区的详细信息。

## REMOVED Requirements
无
