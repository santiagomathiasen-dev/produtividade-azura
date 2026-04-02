const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Meta tags de PWA e Manifesto
const headInjection = `
  <meta name="theme-color" content="#334155"/>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">
`;
if (!html.includes('manifest.json')) {
  html = html.replace('</head>', headInjection + '\n</head>');
}

// 2. Banner Visual de Instalação (Fixo no rodapé flutuante)
const installBannerHTML = `
<!-- PWA Install Banner -->
<div id="pwaInstallBanner" style="display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:90%;max-width:400px;background:#1e293b;color:#fff;padding:16px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:9999;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,0.1);">
  <div style="display:flex;align-items:center;gap:12px;">
    <img src="icon-192.png" width="40" height="40" style="border-radius:8px;background:#334155;">
    <div>
      <div style="font-weight:700;font-size:14px;line-height:1.2;">Azura RH</div>
      <div style="font-size:11px;color:#cbd5e1;margin-top:2px;">Aplicativo nativo mais rápido.</div>
    </div>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="pwaCloseBtn" style="background:transparent;border:none;color:#cbd5e1;font-size:12px;cursor:pointer;padding:8px;">Agora não</button>
    <button id="pwaInstallBtn" style="background:var(--p);border:none;color:#fff;font-weight:600;font-size:12px;padding:8px 14px;border-radius:6px;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);">Instalar</button>
  </div>
</div>
`;
if (!html.includes('pwaInstallBanner')) {
  html = html.replace(/<body>/, '<body>\n' + installBannerHTML);
}

// 3. Logic: Registro de SW e Manipulação do `beforeinstallprompt`
const pwaJS = `
// PWA Service Worker e Prompt de Instalação
let deferredPrompt;
const installBanner = document.getElementById('pwaInstallBanner');
const installBtn = document.getElementById('pwaInstallBtn');
const closeBtn = document.getElementById('pwaCloseBtn');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker Registrado!', reg))
      .catch(err => console.error('PWA SW Erro:', err));
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o prompt automático do Chrome no Android
  e.preventDefault();
  // Guarda o evento para acionar manualmente
  deferredPrompt = e;
  // Mostra o Banner customizado
  if(installBanner) installBanner.style.display = 'flex';
});

if(closeBtn) {
  closeBtn.addEventListener('click', () => {
    installBanner.style.display = 'none';
  });
}

if(installBtn) {
  installBtn.addEventListener('click', async () => {
    installBanner.style.display = 'none';
    if(deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User installation choice:', outcome);
      deferredPrompt = null;
    }
  });
}
`;
if (!html.includes('beforeinstallprompt')) {
  html = html.replace('</script>', pwaJS + '\n</script>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Injeção PWA de classe corporativa finalizada!');
