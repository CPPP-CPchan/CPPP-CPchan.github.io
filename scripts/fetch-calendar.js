// scripts/fetch-calendar.js
const { google } = require('googleapis');
const fs = require('fs').promises;

async function fetchCalendarEvents() {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
  
  if (!API_KEY || !CALENDAR_ID) {
    console.error('環境変数 GOOGLE_API_KEY および GOOGLE_CALENDAR_ID を設定してください');
    process.exit(1);
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: API_KEY });
    
    // 現在時刻から1週間後まで
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    console.log(`カレンダーデータを取得中: ${timeMin} から ${timeMax}`);
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50
    });

    const events = response.data.items || [];
    console.log(`${events.length}件のイベントを取得しました`);

    // イベントデータを変換
    const processedEvents = events.map(event => {
      return {
        id: event.id,
        title: event.summary || '無題の配信',
        description: cleanDescription(event.description) || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location || '',
        status: determineEventStatus(event),
        tags: cleanDescription(extractTags(event.summary, event.description)),
        links: generateLinks(event)
      };
    });

    // JSONデータを作成
    const scheduleData = {
      lastUpdated: new Date().toISOString(),
      events: processedEvents,
      metadata: {
        timezone: 'Asia/Tokyo',
        source: 'Google Calendar',
        generatedBy: 'GitHub Actions'
      }
    };

    // ファイルに保存
    await fs.writeFile(
      'data/schedule-data.json', 
      JSON.stringify(scheduleData, null, 2),
      'utf8'
    );
    
    console.log('配信予定データを data/schedule-data.json に保存しました');
    
  } catch (error) {
    console.error('カレンダーデータの取得に失敗しました:', error);
    process.exit(1);
  }
}

function determineEventStatus(event) {
  const now = new Date();
  const startTime = new Date(event.start.dateTime || event.start.date);
  const endTime = event.end ? new Date(event.end.dateTime || event.end.date) : null;
  
  // 配信中
  if (startTime <= now && (!endTime || endTime > now)) {
    return 'live';
  }
  
  // 1時間以内に開始予定
  const oneHour = 60 * 60 * 1000;
  if (startTime > now && (startTime - now) <= oneHour) {
    return 'upcoming';
  }
  
  // それ以外は予定
  return 'scheduled';
}

function extractTags(title, description) {
  const tags = [];
  const text = `${title} ${description}`.toLowerCase();
  
  // ハッシュタグを抽出
  const hashtagMatches = text.match(/#[^\s#]+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches);
  }
  
  // ゲーム名を推測
  const gameKeywords = {
    'qma': 'QMA',
    'クイズマジックアカデミー': 'QMA',
    '麻雀': '麻雀',
    'minecraft': 'Minecraft',
    'マインクラフト': 'Minecraft',
    '雑談': '雑談',
    'zatsudan': '雑談'
  };
  
  Object.entries(gameKeywords).forEach(([keyword, tag]) => {
    if (text.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });
  
  return tags;
}

// HTMLタグを除去してプレーンテキストに変換する関数
function cleanDescription(htmlDescription) {
  // 値が存在しない、または文字列でない場合は空文字を返す
  if (!htmlDescription || typeof htmlDescription !== 'string') {
    return '';
  }
  
  // 改行タグを改行文字に
  let newlinereplaced = htmlDescription.replace(/<br\s*\/?>/gi, '\n');
  
  // その他のHTMLタグを除去
  let cleaned = newlinereplaced.replace(/<[^>]*>/g, '');
  
  // HTML エンティティをデコード
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // 連続する空白や改行を整理
  cleaned = cleaned
    .replace(/\s+/g, ' ') // 連続する空白を1つに
    .replace(/\n\s*\n/g, '\n') // 連続する改行を1つに
    .trim();
  
  return cleaned;
}

function generateLinks(event) {
  const links = [];
  
  // YouTube配信リンクを検索（より包括的なパターン）
  const description = event.description || '';
  const youtubePatterns = [
    /https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /https?:\/\/(www\.)?youtube\.com\/live\/[\w-]+/,
    /https?:\/\/youtu\.be\/[\w-]+/
  ];
  
  for (const pattern of youtubePatterns) {
    const match = description.match(pattern);
    if (match) {
      links.push({
        type: 'youtube',
        text: 'YouTube配信',
        url: match[0]
      });
      break; // 最初に見つかったものを使用
    }
  }
  
  // デフォルトのYouTubeチャンネルリンク
  if (links.length === 0) {
    links.push({
      type: 'youtube',
      text: 'YouTubeチャンネル',
      url: 'https://www.youtube.com/@CP-chan'
    });
  }
  
  return links;
}

// スクリプト実行
if (require.main === module) {
  fetchCalendarEvents();
}
