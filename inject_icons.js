const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Injetar o Phosphor Icons CDN no <head> se ainda não existir
if (!content.includes('unpkg.com/@phosphor-icons')) {
  content = content.replace('</head>', '  <script src="https://unpkg.com/@phosphor-icons/web"></script>\n</head>');
}

// 2. Substituir a Logo "HR" pelo ícone de Prédio/Corporate
content = content.replace(/<div class="logo">HR<\/div>/, '<div class="logo"><i class="ph ph-briefcase" style="font-size:24px;"></i></div>');

// 3. Substituir Abas (TABS)
content = content.replace(/> Dashboard<\/button>/, '><i class="ph ph-squares-four"></i> Dashboard</button>');
content = content.replace(/> Colaboradores<\/button>/, '><i class="ph ph-users"></i> Colaboradores</button>');
content = content.replace(/> Avaliação<\/button>/, '><i class="ph ph-clipboard-text"></i> Avaliação</button>');
content = content.replace(/> Checklists<\/button>/, '><i class="ph ph-check-square-offset"></i> Checklists</button>');
content = content.replace(/> Matriz 9-Box<\/button>/, '><i class="ph ph-target"></i> Matriz 9-Box</button>');
content = content.replace(/> Recomendações<\/button>/, '><i class="ph ph-lightbulb"></i> Recomendações</button>');
content = content.replace(/> Histórico<\/button>/, '><i class="ph ph-clock-counter-clockwise"></i> Histórico</button>');

// 4. Substituir Botões do Header
content = content.replace(/> Exportar PDF<\/button>/g, '><i class="ph ph-file-pdf"></i> Exportar PDF</button>');
content = content.replace(/> Reset<\/button>/, '><i class="ph ph-arrow-counter-clockwise"></i> Reset</button>');

// 5. Substituir Ícones dos KPIs na função JS (renderKPIs)
content = content.replace(/<div class="kpi-ico ic-b"><\/div>/, '<div class="kpi-ico ic-b"><i class="ph ph-users" style="color:var(--p);"></i></div>');
content = content.replace(/<div class="kpi-ico ic-g"><\/div>/g, '<div class="kpi-ico ic-g"><i class="ph ph-star" style="color:var(--text);"></i></div>');
content = content.replace(/<div class="kpi-ico ic-r"><\/div>/, '<div class="kpi-ico ic-r"><i class="ph ph-warning" style="color:var(--text);"></i></div>');


// 6. Botões de Ação na Tabela e Listas
content = content.replace(/> Novo Colaborador<\/button>/, '><i class="ph ph-user-plus"></i> Novo Colaborador</button>');
content = content.replace(/> Ver<\/button>/g, '><i class="ph ph-eye"></i> Ver</button>');
content = content.replace(/> Avaliar<\/button>/g, '><i class="ph ph-pencil-line"></i> Avaliar</button>');
content = content.replace(/> Editar<\/button>/g, '><i class="ph ph-pencil-simple"></i> Editar</button>');
content = content.replace(/"[^"]*Excluir" onclick="removerChecklistItem/g, '"" onclick="removerChecklistItem');

// Remover o 🗑️ antigo que foi limpo (agora provavelmnete está com texto vazio nos botões que tinham só o lixeiro)
// Restaurar botões de lixeira da tabela de colaboradores "del" class
content = content.replace(/<button class="btn-act del" onclick="confirmarExclusao\(\$\{c\.id\}\)"><\/button>/g, '<button class="btn-act del" title="Excluir" onclick="confirmarExclusao(${c.id})"><i class="ph ph-trash"></i></button>');
content = content.replace(/<button class="btn-act del" title="Remover" onclick="removerChecklistItem\('([^']+)'\,'([^']+)'\,([^)]+)\)"><\/button>/g, '<button class="btn-act del" title="Remover" onclick="removerChecklistItem(\'$1\',\'$2\',$3)"><i class="ph ph-trash"></i></button>');


// 7. Estilo dos ícones
const iconCSS = `
/* ICON STYLES */
i.ph { font-size: 1.15em; vertical-align: middle; margin-right: 4px; }
.tab-btn i.ph { font-size: 1.25em; }
.kpi-ico i.ph { font-size: 24px; margin-right: 0; }
.btn-act i.ph { font-size: 1.2em; margin-right: 2px; }
`;
if (!content.includes('/* ICON STYLES */')) {
  content = content.replace('</style>', iconCSS + '\n</style>');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Ícones Phosphor (design profissional) injetados com sucesso.');
