import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MongoDB自动备份脚本
 * 功能：
 * 1. 每日自动备份数据库
 * 2. 保留最近7天的备份
 * 3. 自动清理过期备份
 */
async function backupDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map';
  const dbName = mongoUri.split('/').pop() || 'travel-map';
  
  // 创建备份目录
  const backupDir = path.join(__dirname, '../../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 生成备份文件名（带时间戳）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${dbName}-${timestamp}`);

  console.log(`开始备份数据库: ${dbName}`);
  console.log(`备份路径: ${backupPath}`);

  try {
    // 使用mongodump命令备份
    const { stdout, stderr } = await execAsync(
      `mongodump --uri="${mongoUri}" --out="${backupPath}"`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    if (stderr && !stderr.includes('done')) {
      console.error('备份警告:', stderr);
    }

    console.log('✅ 数据库备份成功！');
    console.log(`备份时间: ${new Date().toLocaleString('zh-CN')}`);

    // 清理过期备份（保留最近7天）
    await cleanupOldBackups(backupDir, 7);

    return { success: true, path: backupPath };
  } catch (error) {
    console.error('❌ 数据库备份失败:', error);
    return { success: false, error };
  }
}

/**
 * 清理过期备份文件
 * @param backupDir 备份目录
 * @param keepDays 保留天数
 */
async function cleanupOldBackups(backupDir: string, keepDays: number) {
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
  const maxAge = keepDays * 24 * 60 * 60 * 1000; // 转换为毫秒

  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.birthtime.getTime();

    if (age > maxAge) {
      fs.rmSync(filePath, { recursive: true, force: true });
      deletedCount++;
      console.log(`已删除过期备份: ${file}`);
    }
  }

  if (deletedCount > 0) {
    console.log(`清理完成，删除了 ${deletedCount} 个过期备份`);
  }
}

/**
 * 恢复数据库
 * @param backupPath 备份文件路径
 */
async function restoreDatabase(backupPath: string) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-map';
  const dbName = mongoUri.split('/').pop() || 'travel-map';

  console.log(`开始恢复数据库: ${dbName}`);
  console.log(`备份路径: ${backupPath}`);

  try {
    const { stdout, stderr } = await execAsync(
      `mongorestore --uri="${mongoUri}" --drop "${backupPath}/${dbName}"`,
      { maxBuffer: 1024 * 1024 * 10 }
    );

    if (stderr && !stderr.includes('done')) {
      console.error('恢复警告:', stderr);
    }

    console.log('✅ 数据库恢复成功！');
    return { success: true };
  } catch (error) {
    console.error('❌ 数据库恢复失败:', error);
    return { success: false, error };
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'restore' && args[1]) {
    await restoreDatabase(args[1]);
  } else {
    await backupDatabase();
  }
}

main().catch(console.error);
