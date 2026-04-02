const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remover Emojis (Regex básico para emojis e símbolos diversos usados no projeto)
const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}⭐⚠️🏆👥✅🎯💡📅📋📌💪📝🔍📄✏️🗑️❓💾]/gu;
content = content.replace(emojiRegex, '');

// Limpar espaços duplos deixados pelos emojis
content = content.replace(/  +/g, ' ');

// 2. Atualizar o CSS para um tema ainda mais Sóbrio e Profissional (Corporate Slate/Monochrome)
const newCSS = `:root{
  --p:#334155;--p2:#1e293b;--p3:#475569;--p-bg:#f8fafc;
  --g:#475569;--g2:#334155;--g3:#64748b;--g-bg:#f8fafc;
  --bg:#f1f5f9;--card:#ffffff;--border:#e2e8f0;
  --text:#0f172a;--text2:#334155;--muted:#64748b;
  --red:#94a3b8;--red-bg:#f8fafc;
  --orange:#64748b;--orange-bg:#f8fafc;
  --shadow:0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02);
  --shadow-lg:0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03);
  --r:4px;--rs:4px;
}`;

content = content.replace(/:root\{[\s\S]*?--rs:[^;]+;\n\}/m, newCSS);

// Remover gradientes de botões de recomendação para fundos sólidos
content = content.replace(/\.rec-hd\.promover\{background:linear-gradient[^\}]+}/, '.rec-hd.promover{background:var(--p2);}');
content = content.replace(/\.rec-hd\.manter\{background:linear-gradient[^\}]+}/, '.rec-hd.manter{background:var(--p);}');
content = content.replace(/\.rec-hd\.treinar\{background:linear-gradient[^\}]+}/, '.rec-hd.treinar{background:var(--p3);}');
content = content.replace(/\.rec-hd\.risco\{background:linear-gradient[^\}]+}/, '.rec-hd.risco{background:var(--muted);}');

// A logo
content = content.replace(/<div class="logo"><\/div>/, '<div class="logo">HR</div>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sobriedade aplicada com sucesso.');
