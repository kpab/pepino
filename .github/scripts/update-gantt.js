const fs = require('fs');
const path = require('path');

// GitHub APIを使用してIssue/PR統計を取得
async function fetchGitHubStats() {
  const { Octokit } = require('@octokit/rest');
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'kpab';
  const repo = 'pepino';

  try {
    // Issues取得
    const issues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    // PRs取得
    const pulls = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    return {
      issues: issues.data,
      pulls: pulls.data,
    };
  } catch (error) {
    console.error('GitHub API取得エラー:', error);
    return { issues: [], pulls: [] };
  }
}

// ラベル別にタスクの進捗を分析
function analyzeTaskProgress(issues, pulls, tasks) {
  const progressMap = {};

  tasks.forEach(task => {
    const relevantIssues = issues.filter(issue => 
      task.github_labels.some(label => 
        issue.labels.some(issueLabel => issueLabel.name === label)
      )
    );

    const relevantPRs = pulls.filter(pr => 
      task.github_labels.some(label => 
        pr.labels.some(prLabel => prLabel.name === label)
      )
    );

    const totalItems = relevantIssues.length + relevantPRs.length;
    const completedItems = relevantIssues.filter(issue => issue.state === 'closed').length +
                          relevantPRs.filter(pr => pr.state === 'closed').length;

    let status = task.status; // デフォルトはタスク定義の状態
    
    if (totalItems > 0) {
      const completionRate = completedItems / totalItems;
      
      if (completionRate >= 1.0) {
        status = 'done';
      } else if (completionRate > 0.0) {
        status = 'active';
      } else {
        status = 'pending';
      }
    }

    progressMap[task.id] = {
      status,
      completionRate: totalItems > 0 ? completedItems / totalItems : 0,
      issueCount: relevantIssues.length,
      prCount: relevantPRs.length,
      completedIssues: relevantIssues.filter(issue => issue.state === 'closed').length,
      completedPRs: relevantPRs.filter(pr => pr.state === 'closed').length,
    };
  });

  return progressMap;
}

// Mermaidガントチャートを生成
function generateMermaidGantt(tasks, progressMap) {
  let gantt = `gantt
    title Pepino MVP 開発スケジュール
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    
`;

  // セクション別にタスクをグループ化
  const sections = {};
  tasks.forEach(task => {
    if (!sections[task.section]) {
      sections[task.section] = [];
    }
    sections[task.section].push(task);
  });

  // 各セクションのガントチャートを生成
  Object.entries(sections).forEach(([sectionName, sectionTasks]) => {
    gantt += `    section ${sectionName}\n`;
    
    sectionTasks.forEach(task => {
      const progress = progressMap[task.id];
      const status = progress ? progress.status : task.status;
      
      let taskLine = `    ${task.name}           :${status}, ${task.id}`;
      
      if (task.start_date && task.end_date) {
        taskLine += `, ${task.start_date}, ${task.end_date}`;
      } else if (task.start_date && task.duration) {
        taskLine += `, ${task.start_date}, ${task.duration}`;
      } else if (task.dependencies && task.dependencies.length > 0) {
        taskLine += `, after ${task.dependencies[0]}`;
        if (task.duration) {
          taskLine += `, ${task.duration}`;
        }
      }
      
      gantt += taskLine + '\n';
    });
    
    gantt += '    \n';
  });

  return gantt;
}

// 進捗統計を生成
function generateProgressStats(progressMap) {
  const totalTasks = Object.keys(progressMap).length;
  const completedTasks = Object.values(progressMap).filter(p => p.status === 'done').length;
  const activeTasks = Object.values(progressMap).filter(p => p.status === 'active').length;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    overallProgress,
    progressMap
  };
}

// ガントチャートファイルを更新
function updateGanttFile(ganttChart, stats) {
  const filePath = path.join(__dirname, '../../docs/docs/project-management/04-gantt-chart.md');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 現在日付を更新
    const currentDate = new Date().toISOString().split('T')[0];
    content = content.replace(/\*\*現在日\*\*: \d{4}-\d{2}-\d{2}/, `**現在日**: ${currentDate} ✅`);
    
    // Mermaidガントチャートを更新
    const mermaidRegex = /```mermaid\ngantt[\s\S]*?```/;
    const newMermaidBlock = '```mermaid\n' + ganttChart + '```';
    content = content.replace(mermaidRegex, newMermaidBlock);
    
    // 進捗率を更新
    const progressRegex = /\*\*進捗率\*\*: \d+%/;
    content = content.replace(progressRegex, `**進捗率**: ${stats.overallProgress}%`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('✅ ガントチャートファイルを更新しました');
    console.log(`📊 全体進捗: ${stats.overallProgress}% (${stats.completedTasks}/${stats.totalTasks} tasks)`);
    
  } catch (error) {
    console.error('ガントチャートファイル更新エラー:', error);
  }
}

// メイン処理
async function main() {
  try {
    console.log('🚀 ガントチャート自動更新を開始...');
    
    // タスク設定を読み込み
    const tasksPath = path.join(__dirname, 'gantt-tasks.json');
    const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    
    // GitHub統計を取得
    const { issues, pulls } = await fetchGitHubStats();
    console.log(`📊 Issues: ${issues.length}, PRs: ${pulls.length}`);
    
    // 進捗を分析
    const progressMap = analyzeTaskProgress(issues, pulls, tasksData.tasks);
    
    // Mermaidガントチャートを生成
    const ganttChart = generateMermaidGantt(tasksData.tasks, progressMap);
    
    // 統計を生成
    const stats = generateProgressStats(progressMap);
    
    // ファイルを更新
    updateGanttFile(ganttChart, stats);
    
    // 進捗レポートを出力
    console.log('\n📋 タスク進捗詳細:');
    Object.entries(progressMap).forEach(([taskId, progress]) => {
      const task = tasksData.tasks.find(t => t.id === taskId);
      console.log(`  ${task.name}: ${progress.status} (${Math.round(progress.completionRate * 100)}%)`);
    });
    
  } catch (error) {
    console.error('❌ 処理エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { main, fetchGitHubStats, analyzeTaskProgress, generateMermaidGantt };