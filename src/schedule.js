// src/schedule.js
document.addEventListener('DOMContentLoaded', async function() {
  const loadingElement = document.getElementById('loading');
  const containerElement = document.getElementById('schedule-container');
  const noScheduleElement = document.getElementById('no-schedule');

  try {
    // 配信予定データを読み込み
    const response = await fetch('data/schedule-data.json');
    if (!response.ok) {
      throw new Error('配信予定データの読み込みに失敗しました');
    }
    
    const data = await response.json();
    
    // ローディング非表示
    loadingElement.style.display = 'none';
    
    if (data.events && data.events.length > 0) {
      renderSchedule(data.events, data.lastUpdated);
      containerElement.style.display = 'block';
    } else {
      noScheduleElement.style.display = 'block';
    }
    
  } catch (error) {
    console.error('配信予定の読み込みエラー:', error);
    loadingElement.innerHTML = '<p>配信予定の読み込みに失敗しました。しばらく経ってから再度お試しください。</p>';
  }
});

function renderSchedule(events, lastUpdated) {
  const container = document.getElementById('schedule-container');
  
  events.forEach(event => {
    const card = createScheduleCard(event);
    container.appendChild(card);
  });
  
  // 最終更新時刻を表示
  if (lastUpdated) {
    const updateInfo = document.createElement('div');
    updateInfo.className = 'last-updated';
    updateInfo.textContent = `最終更新: ${formatDate(new Date(lastUpdated))}`;
    container.appendChild(updateInfo);
  }
}

function createScheduleCard(event) {
  const card = document.createElement('div');
  card.className = `schedule-card ${getEventStatusClass(event.status)}`;
  
  const startTime = new Date(event.start);
  const endTime = event.end ? new Date(event.end) : null;
  
  card.innerHTML = `
    <div class="schedule-header">
      <div>
        <div class="schedule-date">${formatDate(startTime)}</div>
        <div class="schedule-time">${formatTime(startTime)}${endTime ? ' - ' + formatTime(endTime) : ''}</div>
      </div>
      <div class="schedule-status status-${event.status}">
        ${getStatusText(event.status)}
      </div>
    </div>
    
    <div class="schedule-title">${escapeHtml(event.title)}</div>
    
    ${event.description ? `<div class="schedule-description">${escapeHtml(event.description)}</div>` : ''}
    
    ${event.tags && event.tags.length > 0 ? `
      <div class="schedule-tags">
        ${event.tags.map(tag => `<span class="schedule-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    ` : ''}
    
    ${event.links && event.links.length > 0 ? `
      <div class="schedule-links">
        ${event.links.map(link => `
          <a href="${escapeHtml(link.url)}" target="_blank" class="schedule-link ${link.type}">
            ${escapeHtml(link.text)}
          </a>
        `).join('')}
      </div>
    ` : ''}
  `;
  
  return card;
}

function getEventStatusClass(status) {
  switch (status) {
    case 'live': return 'live';
    case 'upcoming': return 'upcoming';
    case 'scheduled': return 'scheduled';
    default: return 'scheduled';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'live': return '配信中';
    case 'upcoming': return 'まもなく';
    case 'scheduled': return '予定';
    default: return '予定';
  }
}

function formatDate(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '明日';
  } else if (diffDays === -1) {
    return '昨日';
  } else {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
  }
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 説明文を処理する関数を追加
function processDescription(description) {
  if (!description) return '';
  
  // HTMLタグを除去（安全のため）
  let processed = description.replace(/<[^>]*>/g, '');
  
  // 改行を<br>に変換
  processed = processed.replace(/\n/g, '<br>');
  
  // URLを自動リンク化
  processed = processed.replace(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    '<a href="function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}" target="_blank" rel="noopener noreferrer">function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}</a>'
  );
  
  // ハッシュタグを強調表示
  processed = processed.replace(
    /#[^\s#]+/g,
    '<strong class="hashtag">function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}</strong>'
  );
  
  return processed;
}