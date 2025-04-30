// services/kv-web-viewer.ts
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { KVUser, KVWord } from "../types.ts";
import { logger } from "../utils/logger.ts";
import { kv } from "../shared.ts";

const app = new Hono();
const PORT = 3333;

// API Endpoint для получения всех пользователей
app.get("/api/users", async (c) => {
  try {
    const users = await collectUsers();
    return c.json({ success: true, users });
  } catch (e) {
    logger.error(
      `Error getting users: ${e instanceof Error ? e.message : String(e)}`,
    );
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

// API Endpoint для получения слов конкретного пользователя
app.get("/api/users/:userId/words", async (c) => {
  try {
    const userId = c.req.param("userId");
    const words = await collectUserWords(userId);
    return c.json({ success: true, words });
  } catch (e) {
    logger.error(
      `Error getting user words: ${e instanceof Error ? e.message : String(e)}`,
    );
    return c.json({ success: false, error: "Failed to fetch user words" }, 500);
  }
});

// API Endpoint для получения статистики
app.get("/api/stats", async (c) => {
  try {
    const stats = await collectStats();
    return c.json({ success: true, stats });
  } catch (e) {
    logger.error(
      `Error getting stats: ${e instanceof Error ? e.message : String(e)}`,
    );
    return c.json({ success: false, error: "Failed to fetch stats" }, 500);
  }
});

// Serve the HTML frontend
app.get("/", async (c) => {
  return c.html(generateHTML());
});

async function collectStats() {
  // Получаем всех пользователей
  const users = await collectUsers();
  let totalWords = 0;

  const userStats = [];
  for (const user of users) {
    const words = await collectUserWords(user.telegram_id.toString());
    totalWords += words.length;

    userStats.push({
      id: user.telegram_id.toString(),
      telegram_id: user.telegram_id,
      username: user.username || `User ${user.telegram_id}`,
      language: user.language,
      wordCount: words.length,
    });
  }

  return {
    totalUsers: users.length,
    totalWords,
    avgWordsPerUser: users.length > 0
      ? (totalWords / users.length).toFixed(1)
      : 0,
    users: userStats,
  };
}

async function collectUsers(): Promise<KVUser[]> {
  const users: KVUser[] = [];
  const entries = kv.list<KVUser>({ prefix: ["users"] });

  for await (const entry of entries) {
    // Только записи с ключом длиной 2 (["users", "telegramId"]) и наличием поля telegram_id
    if (
      entry.key.length === 2 && entry.value &&
      typeof entry.value === "object" && "telegram_id" in entry.value
    ) {
      users.push(entry.value);
    }
  }

  return users;
}

async function collectUserWords(userId: string): Promise<KVWord[]> {
  const words: KVWord[] = [];
  const entries = kv.list<KVWord>({ prefix: ["users", userId, "words"] });

  for await (const entry of entries) {
    if (entry.value) {
      words.push(entry.value);
    }
  }

  return words;
}

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chinese Learning Bot - KV Database Viewer</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .stats-box {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      flex: 1;
      padding: 15px;
      background-color: #e8f4fc;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .stat-card h3 {
      margin-top: 0;
    }
    .stat-card .number {
      font-size: 32px;
      font-weight: bold;
      color: #0056b3;
      margin: 10px 0;
    }
    .user-list {
      margin-bottom: 40px;
    }
    .user-item {
      padding: 15px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .user-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .word-count {
      background-color: #0056b3;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
    }
    .user-words {
      display: none;
      margin-top: 15px;
    }
    .word-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .word-table th, .word-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .word-table th {
      background-color: #f2f2f2;
    }
    .word-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .loading {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #666;
    }
    .toggle-button {
      background-color: #eee;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .toggle-button:hover {
      background-color: #ddd;
    }
    .flag {
      display: inline-block;
      margin-left: 10px;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Chinese Learning Bot - KV Database Viewer</h1>
    
    <div class="stats-box" id="stats-container">
      <div class="stat-card">
        <h3>Total Users</h3>
        <div class="number" id="total-users">-</div>
      </div>
      <div class="stat-card">
        <h3>Total Words</h3>
        <div class="number" id="total-words">-</div>
      </div>
      <div class="stat-card">
        <h3>Avg. Words/User</h3>
        <div class="number" id="avg-words">-</div>
      </div>
    </div>
    
    <h2>Users</h2>
    <div class="user-list" id="user-list">
      <div class="loading">Loading users...</div>
    </div>
  </div>

  <script>
    // Переключение видимости слов пользователя
    function toggleUserWords(userId) {
      const wordsContainer = document.getElementById(\`user-words-\${userId}\`);
      const toggleButton = document.getElementById(\`toggle-\${userId}\`);
      
      if (wordsContainer.style.display === 'none' || !wordsContainer.style.display) {
        wordsContainer.style.display = 'block';
        toggleButton.textContent = 'Hide Words';
        
        // Загружаем только если контейнер пустой
        if (wordsContainer.innerHTML === '') {
          wordsContainer.innerHTML = '<div class="loading">Loading words...</div>';
          fetchUserWords(userId);
        }
      } else {
        wordsContainer.style.display = 'none';
        toggleButton.textContent = 'Show Words';
      }
    }
    
    // Загрузка слов пользователя
    async function fetchUserWords(userId) {
      try {
        const response = await fetch(\`/api/users/\${userId}/words\`);
        const data = await response.json();
        
        if (data.success && data.words) {
          const wordsContainer = document.getElementById(\`user-words-\${userId}\`);
          
          if (data.words.length === 0) {
            wordsContainer.innerHTML = '<p>No words added yet.</p>';
            return;
          }
          
          // Сортировка по частоте использования
          data.words.sort((a, b) => b.times_used - a.times_used);
          
          let tableHtml = \`
            <table class="word-table">
              <thead>
                <tr>
                  <th>Hanzi</th>
                  <th>Pinyin</th>
                  <th>Translation</th>
                  <th>Times Used</th>
                  <th>Last Used</th>
                </tr>
              </thead>
              <tbody>
          \`;
          
          data.words.forEach(word => {
            tableHtml += \`
              <tr>
                <td>\${word.hanzi || '-'}</td>
                <td>\${word.pinyin || '-'}</td>
                <td>\${word.translation || '-'}</td>
                <td>\${word.times_used}</td>
                <td>\${word.last_used_at ? new Date(word.last_used_at).toLocaleString() : 'Never'}</td>
              </tr>
            \`;
          });
          
          tableHtml += '</tbody></table>';
          wordsContainer.innerHTML = tableHtml;
        } else {
          throw new Error('Failed to load words');
        }
      } catch (error) {
        console.error('Error fetching user words:', error);
        const wordsContainer = document.getElementById(\`user-words-\${userId}\`);
        wordsContainer.innerHTML = '<p>Error loading words. Please try again.</p>';
      }
    }
    
    // Загрузка статистики
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success && data.stats) {
          document.getElementById('total-users').textContent = data.stats.totalUsers;
          document.getElementById('total-words').textContent = data.stats.totalWords;
          document.getElementById('avg-words').textContent = data.stats.avgWordsPerUser;
          
          // Отрисовка списка пользователей
          const userListContainer = document.getElementById('user-list');
          
          if (data.stats.users.length === 0) {
            userListContainer.innerHTML = '<p>No users found.</p>';
            return;
          }
          
          // Сортировка пользователей по количеству слов (по убыванию)
          data.stats.users.sort((a, b) => b.wordCount - a.wordCount);
          
          let userListHtml = '';
          
          data.stats.users.forEach(user => {
            // Получаем эмодзи флага языка
            let langFlag = '';
            switch(user.language) {
              case 'en': langFlag = '🇬🇧'; break;
              case 'ru': langFlag = '🇷🇺'; break; 
              case 'zh': langFlag = '🇨🇳'; break;
              case 'es': langFlag = '🇪🇸'; break;
              case 'fr': langFlag = '🇫🇷'; break;
              case 'de': langFlag = '🇩🇪'; break;
              case 'it': langFlag = '🇮🇹'; break;
              case 'pt': langFlag = '🇵🇹'; break;
              default: langFlag = '🌍';
            }
            
            userListHtml += \`
              <div class="user-item">
                <div class="user-header">
                  <h3>\${user.username} \${langFlag}</h3>
                  <span class="word-count">\${user.wordCount} words</span>
                </div>
                <div>Telegram ID: \${user.telegram_id}</div>
                <button id="toggle-\${user.id}" class="toggle-button" onclick="toggleUserWords('\${user.id}')">Show Words</button>
                <div id="user-words-\${user.id}" class="user-words"></div>
              </div>
            \`;
          });
          
          userListContainer.innerHTML = userListHtml;
        } else {
          throw new Error('Failed to load stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        document.getElementById('user-list').innerHTML = '<p>Error loading data. Please refresh the page.</p>';
      }
    }
    
    // Initial data load
    window.onload = fetchStats;
  </script>
</body>
</html>`;
}

// Запуск сервера
console.log(`KV Database Web Viewer starting on http://localhost:${PORT}`);
Deno.serve({ port: PORT }, app.fetch);
