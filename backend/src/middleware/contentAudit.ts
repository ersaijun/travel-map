/**
 * 内容审核中间件
 * 功能：
 * 1. 敏感词过滤
 * 2. 违规内容检测
 * 3. 内容安全评分
 */

// 敏感词库（示例，实际应从数据库或配置文件加载）
const SENSITIVE_WORDS = [
  // 政治敏感词
  '反动', '颠覆', '分裂', '恐怖', '暴力',
  // 色情词汇
  '色情', '淫秽', '裸体',
  // 违法词汇
  '赌博', '毒品', '走私', '诈骗',
  // 其他违规词汇
  '刷单', '代开发票', '套现'
];

// 违规模式（正则表达式）
const VIOLATION_PATTERNS = [
  /[\u4e00-\u9fa5]{0,}(微信号|微信|加我|私聊|联系我)[\u4e00-\u9fa5]{0,}[\d\w-]{6,}/gi,
  /[\u4e00-\u9fa5]{0,}(QQ|qq)[\u4e00-\u9fa5]{0,}[\d]{5,}/gi,
  /[\u4e00-\u9fa5]{0,}(电话|手机|联系方式)[\u4e00-\u9fa5]{0,}[\d]{11}/gi,
  /(http|https):\/\/[^\s]+/gi, // 网址链接
];

export interface ContentAuditResult {
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchedWords: string[];
  matchedPatterns: string[];
  score: number; // 0-100，100为完全安全
  suggestion: string;
}

/**
 * 审核文本内容
 */
export function auditContent(text: string): ContentAuditResult {
  if (!text || text.trim().length === 0) {
    return {
      isSafe: true,
      riskLevel: 'low',
      matchedWords: [],
      matchedPatterns: [],
      score: 100,
      suggestion: '内容为空，无需审核'
    };
  }

  const matchedWords: string[] = [];
  const matchedPatterns: string[] = [];
  let score = 100;

  // 1. 检测敏感词
  for (const word of SENSITIVE_WORDS) {
    if (text.includes(word)) {
      matchedWords.push(word);
      score -= 20;
    }
  }

  // 2. 检测违规模式
  for (const pattern of VIOLATION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matchedPatterns.push(...matches);
      score -= 15;
    }
  }

  // 3. 计算风险等级
  let riskLevel: ContentAuditResult['riskLevel'] = 'low';
  if (score < 40) {
    riskLevel = 'critical';
  } else if (score < 60) {
    riskLevel = 'high';
  } else if (score < 80) {
    riskLevel = 'medium';
  }

  // 4. 生成建议
  let suggestion = '';
  if (matchedWords.length > 0) {
    suggestion += `检测到敏感词：${matchedWords.join('、')}。`;
  }
  if (matchedPatterns.length > 0) {
    suggestion += `检测到违规内容模式。`;
  }
  if (score === 100) {
    suggestion = '内容安全，可以发布';
  }

  return {
    isSafe: score >= 60,
    riskLevel,
    matchedWords,
    matchedPatterns,
    score: Math.max(0, score),
    suggestion
  };
}

/**
 * 过滤敏感词（替换为*）
 */
export function filterSensitiveWords(text: string): string {
  let filtered = text;
  
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }

  return filtered;
}

/**
 * 内容审核中间件工厂函数
 */
export function createContentAuditMiddleware(options: {
  fields?: string[]; // 需要审核的字段
  blockOnHighRisk?: boolean; // 高风险时是否阻止
} = {}) {
  const fields = options.fields || ['title', 'content', 'notes', 'description'];
  const blockOnHighRisk = options.blockOnHighRisk !== false;

  return async (request: any, reply: any) => {
    // 只检查POST、PUT、PATCH请求
    if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return;
    }

    const body = request.body;
    if (!body || typeof body !== 'object') {
      return;
    }

    const auditResults: { field: string; result: ContentAuditResult }[] = [];

    // 审核指定字段
    for (const field of fields) {
      if (body[field] && typeof body[field] === 'string') {
        const result = auditContent(body[field]);
        auditResults.push({ field, result });

        // 自动过滤敏感词
        if (result.matchedWords.length > 0) {
          body[field] = filterSensitiveWords(body[field]);
        }
      }
    }

    // 检查是否有高风险内容
    const highRiskItems = auditResults.filter(
      item => item.result.riskLevel === 'high' || item.result.riskLevel === 'critical'
    );

    if (highRiskItems.length > 0 && blockOnHighRisk) {
      return reply.status(400).send({
        error: '内容审核未通过',
        details: highRiskItems.map(item => ({
          field: item.field,
          riskLevel: item.result.riskLevel,
          suggestion: item.result.suggestion
        }))
      });
    }

    // 将审核结果附加到请求对象
    request.contentAudit = auditResults;
  };
}
