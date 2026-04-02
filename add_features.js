const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Header Backup Button
html = html.replace(
  /><i class="ph ph-file-pdf"><\/i> Exportar PDF<\/button>/,
  '><i class="ph ph-file-pdf"></i> PDF</button>\n    <button class="btn-p" onclick="exportarBackupJSON()" style="background:var(--p);color:#fff;border:none;padding:8px 12px;border-radius:var(--rs);font-weight:600;font-size:12px;display:flex;align-items:center;gap:6px;transition:all .2s;"><i class="ph ph-download-simple"></i> Baixar Backup</button>'
);

// 2. Tab CLT
html = html.replace(
  /<\/div>\s*<\/div>\s*<!-- KPIs -->/,
  '  <button class="tab-btn" onclick="switchTab(\'leis\',document.querySelectorAll(\'.tab-btn\')[4])"><i class="ph ph-scales"></i> Normas CLT</button>\n  </div>\n</div>\n\n<!-- KPIs -->'
);

// 3. Content Tab Leis
const tabLeis = `
  <!-- TAB: LEIS E CLT -->
  <div class="tab-pane" id="tab-leis">
    <div class="g2 mt">
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="ph ph-book-open"></i> Resumo Trabalhista (CLT)</div></div>
        <div style="font-size:12.5px;color:var(--text2);line-height:1.6;display:flex;flex-direction:column;gap:12px;max-height:450px;overflow-y:auto;padding-right:8px;">
          <div><strong>⏱️ Jornada de Trabalho (Setor Hoteleiro/Restaurantes)</strong><br>A jornada padrão no Brasil é de 44 horas semanais e 8 horas diárias. Restaurantes costumam operar na escala 6x1 (uma folga semanal, obrigatoriamente um domingo a cada mês). A jornada 12x36 também é permitida mediante acordo coletivo.</div>
          <div><strong>🍔 Intervalo Intrajornada</strong><br>Para jornadas maiores que 6 horas, é obrigatório intervalo mínimo de 1 hora para refeição e descanso. Não pode ser reduzido sem acordo prévio e oficial.</div>
          <div><strong>⚠️ Adicional de Insalubridade</strong><br>Aplicável a funções específicas dependendo do laudo (PGR/PCMSO). Profissionais de limpeza (banheiros de alto fluxo) ou operadores de câmaras frias costumam receber grau médio (20%) ou máximo (40%) sob o salário mínimo.</div>
          <div><strong>🌙 Adicional Noturno</strong><br>Trabalho executado entre 22h e 05h gera acréscimo de 20% na hora de trabalho, além do cômputo da hora noturna de 52 minutos e 30 segundos.</div>
          <div><strong>💼 Rescisões e Demissões</strong><br>Em desligamentos sem justa causa: paga-se saldo de salários, férias vencidas/proporcionais (+1/3), 13º salário, aviso prévio, além de multa de 40% sobre o saldo total do FGTS.</div>
          <div style="padding:10px;background:var(--p-bg);border-radius:var(--rs);color:var(--p);font-weight:600;font-size:11.5px;">Nota Legal: Este é apenas um guia de referência rápida. Consulte sua convenção coletiva (Sindbares, etc.) e sua contabilidade para a operação diária.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="ph ph-rss"></i> Radar TST (Últimas Decisões)</div><button class="btn-act" onclick="carregarNoticiasTST()"><i class="ph ph-arrows-clockwise"></i> Att</button></div>
        <div id="tst-feed" style="font-size:12.5px;color:var(--text2);line-height:1.5;max-height:450px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
           <div style="padding:30px;text-align:center;color:var(--muted);">Carregando notícias oficiais em tempo real...</div>
        </div>
      </div>
    </div>
  </div>
`;
html = html.replace(/<\/div><!-- \/content -->/, tabLeis + '\n</div><!-- /content -->');

// 4. Backup Logic & Feed Logic
const customLogic = `
function exportarBackupJSON() {
  const data = {
    colaboradores: colaboradores,
    historico: historicoGlobal,
    checklists_cfg: checklistsConfig,
    export_date: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`backup_gastrosense_rh_\${new Date().toISOString().split('T')[0]}.json\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('✓ Arquivo baixado! Você já pode salvar no Drive.', 'ok');
}

async function carregarNoticiasTST() {
  const feedDiv = document.getElementById('tst-feed');
  if(!feedDiv) return;
  feedDiv.innerHTML = '<div style="padding:30px;text-align:center;color:var(--muted);">Conectando TST...</div>';
  try {
    const rssUrl = 'https://www.tst.jus.br/web/guest/noticias?p_p_id=com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_1mFm&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_1mFm_p_p_lifecycle=1&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_1mFm_struts_action=%2Fasset_publisher%2Frss&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_1mFm_type=journal';
    const apiUrl = \`https://api.rss2json.com/v1/api.json?rss_url=\${encodeURIComponent(rssUrl)}\`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if(data.status === 'ok' && data.items.length > 0) {
      let limit = data.items.length > 15 ? 15 : data.items.length;
      feedDiv.innerHTML = data.items.slice(0, limit).map(item => \`
        <a href="\${item.link}" target="_blank" style="text-decoration:none;color:inherit;display:block;padding:10px;border:1px solid var(--border);border-radius:var(--rs);transition:background 0.2s;">
          <strong style="color:var(--text);font-size:13px;display:block;margin-bottom:4px;">\${item.title}</strong>
          <span style="font-size:11px;color:var(--muted);">\${new Date(item.pubDate.replace(' ', 'T')).toLocaleDateString('pt-BR')}</span>
        </a>
      \`).join('');
    } else {
      feedDiv.innerHTML = '<div style="padding:10px;text-align:center;">Não foi possível encontrar notícias. Tente novamente mais tarde.</div>';
    }
  } catch(e) {
    feedDiv.innerHTML = '<div style="padding:10px;text-align:center;color:var(--red);">Erro de comunicação com o portal do TST judiciário.</div>';
  }
}
setTimeout(carregarNoticiasTST, 1500); // Carrega na inicialização com delay sutil
`;
html = html.replace(/<\/script>/, customLogic + '\n</script>');

// 5. Role Configurator Injection
html = html.replace(
  /let sel=document\.getElementById\('selCheckCargo'\)\.value;/,
  "popularCargosGlobais();\\n  let sel=document.getElementById('selCheckCargo').value;"
);

let roleEditorHTML = `
  let html=\`<div style="margin-bottom:18px;font-size:14px;color:var(--text);border-bottom:1px solid var(--border);padding-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <strong>Configurando Checklist de Avaliação para: <span style="color:var(--p);">\${sel}</span></strong>
      <p style="font-size:11px;color:var(--muted);margin-top:4px;">Adicione ou remova tarefas que serão avaliadas para este cargo.</p>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
       \${(sel !== 'Outro' && sel !== 'Chef de Cozinha') ? \`<button class="btn-act del" onclick="deletarCargoChecklist('\${sel}')" title="Excluir"><i class="ph ph-trash"></i> Cargo</button>\` : ''}
       <button class="btn-sec" onclick="promptCriarCargo()" style="display:flex;align-items:center;gap:4px;"><i class="ph ph-plus"></i> Novo Cargo</button>
    </div>
  </div>\`;
`;

// Replace the previous role string setup with the buttons version
html = html.replace(/let html=\`<div style="margin-bottom:18px;font-size:14px;color:var\(--text\);border-bottom:1px solid var\(--border\);padding-bottom:10px;">\s*<strong>Configurando Checklist de Avaliação para: <span style="color:var\(--p\);">\$\{sel\}<\/span><\/strong>\s*<p style="font-size:11px;color:var\(--muted\);margin-top:4px;">Adicione ou remova tarefas que serão avaliadas para este cargo especificamente e clique em Salvar\.<\/p>\s*<\/div>\`;/s, roleEditorHTML);


const roleJS = `
function popularCargosGlobais() {
  const cargos = Object.keys(checklistsConfig);
  const el = document.getElementById('selCheckCargo');
  let sel = el.value || 'Chef de Cozinha';
  el.innerHTML = cargos.map(c => \`<option value="\${c}">\${c}</option>\`).join('');
  if (cargos.includes(sel)) el.value = sel;
}
window.promptCriarCargo = function() {
  const nome = prompt("Digite o nome da nova função (ex: Bartender):");
  if(!nome) return;
  if(checklistsConfig[nome]) { showToast('Esse Cargo já existe no sistema.', 'warn'); return; }
  checklistsConfig[nome] = JSON.parse(JSON.stringify(checklistsConfig['Outro']||{}));
  salvarStorage();
  popularCargosGlobais();
  document.getElementById('selCheckCargo').value = nome;
  renderChecklist();
  showToast('Cargo Criadíssimo!', 'ok');
}
window.deletarCargoChecklist = function(nome) {
  if(confirm("⚠ PERIGO! Tem certeza que deseja apagar os checklists configurados do cargo: " + nome + "?")) {
    delete checklistsConfig[nome];
    document.getElementById('selCheckCargo').value = 'Chef de Cozinha';
    salvarStorage();
    popularCargosGlobais();
    renderChecklist();
  }
}
`;
html = html.replace(/<\/script>/, roleJS + '\n</script>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Features finalizadas!');
