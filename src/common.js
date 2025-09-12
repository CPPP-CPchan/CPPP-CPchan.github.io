const headerTemplate = `
<header>
  <div class="logo">
    <img src="images/cpchan-goldrim.png" alt="しぴちゃん立ち絵">
    <h1>しぴちゃん</h1>
    <p>猫耳VTuber、ゆるっとゲームやってます</p>
  </div>
  <nav>
    <ul>
      <li><a href="index.html">ホーム</a></li>
      <li><a href="index.html#about">自己紹介</a></li>
      <li><a href="schedule.html">配信予定</a></li>
      <li><a href="works.html">制作物</a></li>
      <li><a href="https://note.com/cppp_cpchan/">まじめnote</a></li>      
      // <li><a href="#">ブログ（まだ）</a></li>
      <li><a href="https://marshmallow-qa.com/qeesq0ftfry6tne?t=oJwLKH&utm_medium=url_text&utm_source=promotion">おたより</a></li>
    </ul>
  </nav>
</header>
`;

// 共通フッターのHTMLテンプレート
const footerTemplate = `
<footer>
  <p>&copy; 2025 しぴちゃん</p>
</footer>
`;

// ページ読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
  // ヘッダーの挿入
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = headerTemplate;
    highlightCurrentPage();
  }

  // フッターの挿入
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerTemplate;
  }
});

// 現在のページに応じてナビゲーションをハイライトする関数
function highlightCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || 
        (currentPage === 'index.html' && href === 'index.html') ||
        (currentPage === 'works.html' && href === 'works.html')) {
      link.style.textDecoration = 'underline';
      link.style.fontWeight = 'bold';
    }
  });
}