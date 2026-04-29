import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::documentation-space-setting.documentation-space-setting',
  ({ strapi }) => ({
    async previewHtml(ctx) {
      const { documentId, secret } = ctx.request.query as Record<string, string>;

      if (!secret || secret !== process.env.PREVIEW_SECRET) {
        ctx.status = 403;
        ctx.body = 'Acceso no autorizado';
        return;
      }
      if (!documentId) {
        ctx.status = 400;
        ctx.body = 'Se requiere documentId';
        return;
      }

      const setting = await strapi
        .documents('api::documentation-space-setting.documentation-space-setting')
        .findOne({
          documentId,
          populate: ['colors', 'typography', 'spacing', 'layout', 'documentation_space'],
        });

      if (!setting) {
        ctx.status = 404;
        ctx.body = 'Configuración no encontrada';
        return;
      }

      // Bypass X-Frame-Options para que el iframe del admin de Strapi pueda cargarlo
      ctx.set('X-Frame-Options', 'SAMEORIGIN');
      ctx.type = 'text/html; charset=utf-8';
      ctx.body = buildPreviewHtml(setting);
    },
  })
);

// ─── HTML builder ────────────────────────────────────────────────────────────

function v(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function buildCssVariables(setting: any): string {
  const c = setting.colors ?? {};
  const t = setting.typography ?? {};
  const s = setting.spacing ?? {};
  const l = setting.layout ?? {};

  return `
    :root {
      --brand-50:  ${v(c.brand50,  '#eff6ff')};
      --brand-500: ${v(c.brand500, '#3b82f6')};
      --brand-900: ${v(c.brand900, '#1e3a8a')};

      --bg-primary:     ${v(c.lightBgPrimary,    '#ffffff')};
      --bg-secondary:   ${v(c.lightBgSecondary,  '#f8fafc')};
      --bg-sidebar:     ${v(c.lightBgSidebar,    '#f1f5f9')};
      --text-primary:   ${v(c.lightTextPrimary,  '#0f172a')};
      --text-secondary: ${v(c.lightTextSecondary,'#475569')};
      --text-muted:     ${v(c.lightTextMuted,    '#94a3b8')};
      --border:         ${v(c.lightBorderColor,  '#e2e8f0')};
      --code-bg:        ${v(c.lightCodeBg,       '#f1f5f9')};
      --code-text:      ${v(c.lightCodeText,     '#0f172a')};
      --callout-bg:     ${v(c.lightCalloutBg,    '#eff6ff')};
      --callout-border: ${v(c.lightCalloutBorder,'#3b82f6')};

      --font-sans: '${v(t.fontSans, 'Inter')}', system-ui, sans-serif;
      --font-mono: '${v(t.fontMono, 'JetBrains Mono')}', monospace;
      --base-size:   ${v(t.baseFontSize,        '16px')};
      --base-lh:     ${v(t.baseLineHeight,      '1.625')};
      --heading-lh:  ${v(t.headingLineHeight,   '1.25')};
      --p-spacing:   ${v(t.paragraphSpacing,    '1rem')};
      --list-gap:    ${v(t.listSpacing,         '0.375rem')};
      --h-top:       ${v(t.headingSpacingTop,   '2rem')};
      --h-bottom:    ${v(t.headingSpacingBottom,'0.75rem')};

      --px:          ${v(s.contentPaddingX, '1.5rem')};
      --py:          ${v(s.contentPaddingY, '2rem')};
      --section-gap: ${v(s.sectionGap,     '2rem')};
      --header-h:    ${v(s.headerHeight,   '3.5rem')};
      --sidebar-w:   ${v(s.sidebarWidth,   '16rem')};

      --max-w:       ${v(l.maxContentWidth,    '72rem')};
      --toc-w:       ${v(l.tocWidth,           '14rem')};
      --radius:      ${v(l.borderRadius,       '0.5rem')};
      --code-radius: ${v(l.codeBorderRadius,   '0.5rem')};
      --transition:  ${v(l.transitionDuration, '0.2s')};
      --easing:      ${v(l.animationEasing,    'cubic-bezier(0.4, 0, 0.2, 1)')};
    }`;
}

function buildPreviewHtml(setting: any): string {
  const siteName    = v(setting.siteName, 'Documentation Portal');
  const siteDesc    = v(setting.siteDescription, 'Plataforma de documentación técnica multi-espacio.');
  const footerText  = v(setting.footerText, `© ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.`);
  const spaceName   = setting.documentation_space?.name ?? 'Espacio de documentación';
  const css         = buildCssVariables(setting);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview — ${siteName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    ${css}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      font-size: var(--base-size);
      line-height: var(--base-lh);
      color: var(--text-primary);
      background: var(--bg-primary);
    }

    /* ── Preview banner ──────────────────────────────── */
    .preview-banner {
      background: linear-gradient(135deg, var(--brand-500), var(--brand-900));
      color: #fff;
      padding: 0.4rem 1rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-align: center;
    }

    /* ── Header ──────────────────────────────────────── */
    .header {
      position: sticky; top: 0;
      height: var(--header-h);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.5rem;
      z-index: 50;
    }
    .header-logo { font-weight: 700; font-size: 1.05rem; color: var(--brand-500); }
    .header-nav { display: flex; gap: 1.25rem; }
    .header-nav a {
      color: var(--text-secondary); text-decoration: none;
      font-size: 0.85rem;
      transition: color var(--transition) var(--easing);
    }
    .header-nav a:hover { color: var(--brand-500); }
    .badge-preview {
      background: var(--brand-50); color: var(--brand-500);
      font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.55rem;
      border-radius: 999px; border: 1px solid var(--brand-500);
      letter-spacing: 0.05em;
    }

    /* ── Layout ──────────────────────────────────────── */
    .layout { display: flex; max-width: 100%; min-height: calc(100vh - var(--header-h)); }

    /* ── Sidebar ─────────────────────────────────────── */
    .sidebar {
      width: var(--sidebar-w); min-width: var(--sidebar-w);
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      padding: var(--py) 0;
      position: sticky; top: var(--header-h);
      height: calc(100vh - var(--header-h));
      overflow-y: auto;
    }
    .sidebar-section { margin-bottom: 1.5rem; }
    .sidebar-label {
      font-size: 0.68rem; font-weight: 700; letter-spacing: 0.09em;
      text-transform: uppercase; color: var(--text-muted);
      padding: 0 1rem; margin-bottom: 0.4rem;
    }
    .sidebar-item {
      display: block; padding: 0.35rem 1rem;
      color: var(--text-secondary); text-decoration: none; font-size: 0.875rem;
      border-left: 2px solid transparent;
      transition: all var(--transition) var(--easing);
    }
    .sidebar-item:hover { color: var(--text-primary); background: var(--bg-secondary); }
    .sidebar-item.active {
      color: var(--brand-500); background: var(--brand-50);
      border-left-color: var(--brand-500); font-weight: 500;
    }
    .sidebar-sub { padding-left: 1.25rem; }

    /* ── Content ─────────────────────────────────────── */
    .content { flex: 1; min-width: 0; padding: var(--py) var(--px); }

    /* ── TOC ─────────────────────────────────────────── */
    .toc {
      width: var(--toc-w); min-width: var(--toc-w);
      padding: var(--py) 1rem;
      position: sticky; top: var(--header-h);
      height: calc(100vh - var(--header-h)); overflow-y: auto;
    }
    .toc-title {
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.75rem;
    }
    .toc-link {
      display: block; padding: 0.22rem 0;
      font-size: 0.8rem; color: var(--text-secondary); text-decoration: none;
      transition: color var(--transition);
    }
    .toc-link:hover, .toc-link.active { color: var(--brand-500); }
    .toc-sub { padding-left: 0.75rem; }

    /* ── Typography ──────────────────────────────────── */
    h1, h2, h3, h4, h5, h6 {
      line-height: var(--heading-lh); color: var(--text-primary);
      font-weight: 700; margin-top: var(--h-top); margin-bottom: var(--h-bottom);
    }
    h1 { font-size: 2rem; margin-top: 0; }
    h2 { font-size: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
    h3 { font-size: 1.2rem; font-weight: 600; }
    h4 { font-size: 1rem; font-weight: 600; }
    h5 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); }
    h6 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

    p { margin-bottom: var(--p-spacing); }
    .lead { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7; }
    a { color: var(--brand-500); text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { font-weight: 600; }
    em { font-style: italic; }

    /* ── Lists ───────────────────────────────────────── */
    ul, ol { padding-left: 1.5rem; margin-bottom: var(--p-spacing); }
    li { margin-bottom: var(--list-gap); }
    li::marker { color: var(--brand-500); }

    /* ── Code ────────────────────────────────────────── */
    code {
      font-family: var(--font-mono); font-size: 0.875em;
      background: var(--code-bg); color: var(--code-text);
      padding: 0.1rem 0.35rem; border-radius: calc(var(--code-radius) / 2);
    }
    pre {
      background: var(--code-bg); color: var(--code-text);
      padding: 1.25rem; border-radius: var(--code-radius);
      overflow-x: auto; margin-bottom: var(--p-spacing);
      font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.65;
      border: 1px solid var(--border);
    }
    pre code { background: none; padding: 0; border-radius: 0; font-size: inherit; }

    /* ── Callout ─────────────────────────────────────── */
    .callout {
      background: var(--callout-bg); border-left: 4px solid var(--callout-border);
      padding: 0.9rem 1.1rem; border-radius: 0 var(--radius) var(--radius) 0;
      margin-bottom: var(--p-spacing);
    }
    .callout-title { font-weight: 600; color: var(--callout-border); margin-bottom: 0.3rem; font-size: 0.875rem; }
    .callout p { margin: 0; font-size: 0.9rem; color: var(--text-primary); }

    /* ── Blockquote ──────────────────────────────────── */
    blockquote {
      border-left: 3px solid var(--border); padding: 0.5rem 1rem;
      color: var(--text-secondary); font-style: italic;
      margin-bottom: var(--p-spacing);
    }

    /* ── Table ───────────────────────────────────────── */
    .table-wrap { overflow-x: auto; margin-bottom: var(--p-spacing); }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th {
      text-align: left; font-weight: 600; font-size: 0.78rem;
      text-transform: uppercase; letter-spacing: 0.05em;
      padding: 0.6rem 0.875rem;
      background: var(--bg-secondary); border-bottom: 2px solid var(--border);
      color: var(--text-secondary);
    }
    td { padding: 0.6rem 0.875rem; border-bottom: 1px solid var(--border); }
    tr:hover td { background: var(--bg-secondary); }

    /* ── Buttons ─────────────────────────────────────── */
    .btn-group { display: flex; gap: 0.625rem; flex-wrap: wrap; margin-bottom: var(--p-spacing); }
    .btn {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.5rem 1rem; border-radius: var(--radius);
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; font-family: var(--font-sans);
      transition: all var(--transition) var(--easing);
    }
    .btn-primary { background: var(--brand-500); color: #fff; }
    .btn-primary:hover { background: var(--brand-900); }
    .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border); }
    .btn-secondary:hover { background: var(--border); }
    .btn-ghost { background: transparent; color: var(--brand-500); border-color: var(--brand-500); }
    .btn-ghost:hover { background: var(--brand-50); }
    .btn-sm { padding: 0.3rem 0.75rem; font-size: 0.8rem; }

    /* ── Badges ──────────────────────────────────────── */
    .badge-group { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: var(--p-spacing); }
    .badge { font-size: 0.68rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 999px; letter-spacing: 0.03em; }
    .badge-blue   { background: var(--brand-50);  color: var(--brand-500); border: 1px solid var(--brand-500); }
    .badge-gray   { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); }
    .badge-green  { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
    .badge-red    { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
    .badge-yellow { background: #fefce8; color: #ca8a04; border: 1px solid #fde047; }

    /* ── Steps ───────────────────────────────────────── */
    .steps { margin-bottom: var(--p-spacing); counter-reset: steps; }
    .step { display: flex; gap: 1rem; margin-bottom: 1.1rem; }
    .step-num {
      width: 1.75rem; height: 1.75rem; min-width: 1.75rem;
      background: var(--brand-500); color: #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; margin-top: 0.1rem;
    }
    .step-body h4 { margin: 0 0 0.2rem; font-size: 0.95rem; }
    .step-body p  { margin: 0; font-size: 0.875rem; color: var(--text-secondary); }

    /* ── Divider ─────────────────────────────────────── */
    hr { border: none; border-top: 1px solid var(--border); margin: var(--section-gap) 0; }

    /* ── Card grid ───────────────────────────────────── */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: var(--p-spacing); }
    .card {
      padding: 1rem; border-radius: var(--radius);
      border: 1px solid var(--border); background: var(--bg-secondary);
      transition: border-color var(--transition) var(--easing);
    }
    .card:hover { border-color: var(--brand-500); }
    .card-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .card h4 { margin: 0 0 0.25rem; font-size: 0.9rem; }
    .card p  { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }

    /* ── Footer ──────────────────────────────────────── */
    .footer {
      border-top: 1px solid var(--border); padding: 1.25rem var(--px);
      font-size: 0.8rem; color: var(--text-muted);
      display: flex; justify-content: space-between; align-items: center;
      gap: 1rem; flex-wrap: wrap;
    }
  </style>
</head>
<body>

  <div class="preview-banner">
    🎨 Vista previa de tema &mdash; <strong>${siteName}</strong> &nbsp;·&nbsp; Espacio: <strong>${spaceName}</strong>
  </div>

  <header class="header">
    <div class="header-logo">${siteName}</div>
    <nav class="header-nav">
      <a href="#">Inicio</a>
      <a href="#">Guías</a>
      <a href="#">API Reference</a>
      <a href="#">Changelog</a>
    </nav>
    <span class="badge-preview">PREVIEW</span>
  </header>

  <div class="layout">

    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Empezando</div>
        <a class="sidebar-item active" href="#">Introducción</a>
        <a class="sidebar-item" href="#">Instalación rápida</a>
        <a class="sidebar-item" href="#">Configuración inicial</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Guías</div>
        <a class="sidebar-item" href="#">Autenticación</a>
        <div class="sidebar-sub">
          <a class="sidebar-item" href="#">JWT Tokens</a>
          <a class="sidebar-item" href="#">OAuth 2.0</a>
          <a class="sidebar-item" href="#">API Keys</a>
        </div>
        <a class="sidebar-item" href="#">Base de datos</a>
        <a class="sidebar-item" href="#">Almacenamiento</a>
        <a class="sidebar-item" href="#">Deploy en producción</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Referencia API</div>
        <a class="sidebar-item" href="#">REST</a>
        <a class="sidebar-item" href="#">GraphQL</a>
        <a class="sidebar-item" href="#">Webhooks</a>
      </div>
    </nav>

    <!-- Main content -->
    <main class="content">

      <div class="badge-group">
        <span class="badge badge-blue">v2.0</span>
        <span class="badge badge-green">Estable</span>
        <span class="badge badge-gray">Actualizado</span>
        <span class="badge badge-yellow">Beta feature</span>
      </div>

      <h1>Introducción a la plataforma</h1>
      <p class="lead">${siteDesc}</p>

      <p>Esta guía cubre los conceptos fundamentales, desde la instalación hasta configuraciones avanzadas. Los ejemplos de esta página usan los colores, tipografía y espaciados configurados en <strong>Documentation Space Setting</strong>, por lo que cualquier cambio que guardes se reflejará aquí al recargar el preview.</p>

      <!-- Callout -->
      <div class="callout">
        <div class="callout-title">📋 Requisitos previos</div>
        <p>Node.js ≥ 20, MySQL 8+, y acceso de administrador al servidor. El preview usa los valores configurados en este espacio; los campos vacíos muestran el valor por defecto del sistema.</p>
      </div>

      <h2>Encabezados — todos los niveles</h2>
      <h3>Este es un H3 — sección de guía</h3>
      <h4>H4 — subsección de referencia</h4>
      <h5>H5 — nota técnica</h5>
      <h6>H6 — etiqueta de categoría</h6>

      <h2>Tipografía y texto enriquecido</h2>
      <p>El texto utiliza la fuente <strong>${setting.typography?.fontSans ?? 'Inter'}</strong> con un tamaño base de <code>${setting.typography?.baseFontSize ?? '16px'}</code> y un interlineado de <code>${setting.typography?.baseLineHeight ?? '1.625'}</code>. Puedes combinar <strong>negrita</strong>, <em>cursiva</em>, <a href="#">enlaces</a> e <code>inline code</code> libremente.</p>

      <blockquote>
        "La documentación bien escrita es la diferencia entre un producto adoptado y uno abandonado. El diseño visual comunica antes que las palabras." — Equipo de producto
      </blockquote>

      <h2>Bloques de código</h2>
      <p>Los bloques usan la fuente <strong>${setting.typography?.fontMono ?? 'JetBrains Mono'}</strong> con fondo <code>lightCodeBg</code> y radio <code>${setting.layout?.codeBorderRadius ?? '0.5rem'}</code>:</p>

      <pre><code># Instalación
git clone https://github.com/org/proyecto.git && cd proyecto
npm install && cp .env.example .env

# Iniciar servidor de desarrollo
npm run develop
# → Admin:  http://localhost:1337/admin
# → API:    http://localhost:1337/api</code></pre>

      <p>El código inline también aplica el tema: <code>const config = await strapi.config.get('admin')</code></p>

      <h2>Variables de entorno</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Variable</th><th>Descripción</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr><td><code>DATABASE_HOST</code></td><td>Host del servidor MySQL</td><td><span class="badge badge-red">Requerida</span></td></tr>
            <tr><td><code>DATABASE_PASSWORD</code></td><td>Contraseña del usuario de BD</td><td><span class="badge badge-red">Requerida</span></td></tr>
            <tr><td><code>ADMIN_JWT_SECRET</code></td><td>Secreto para tokens de admin</td><td><span class="badge badge-red">Requerida</span></td></tr>
            <tr><td><code>FRONTEND_URL</code></td><td>URL del frontend para CORS</td><td><span class="badge badge-gray">Opcional</span></td></tr>
            <tr><td><code>PREVIEW_SECRET</code></td><td>Secreto compartido para live preview</td><td><span class="badge badge-yellow">Recomendada</span></td></tr>
            <tr><td><code>WASABI_BUCKET</code></td><td>Bucket de Wasabi S3</td><td><span class="badge badge-gray">Opcional</span></td></tr>
          </tbody>
        </table>
      </div>

      <h2>Pasos de configuración</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-body">
            <h4>Crear un Documentation Space</h4>
            <p>En el panel admin, navega a <em>Content Manager → Documentation Space</em> y crea tu primer espacio con nombre y slug únicos.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-body">
            <h4>Configurar el tema visual</h4>
            <p>Abre <em>Documentation Space Setting</em>, asocia el espacio y ajusta colores, tipografía y layout según tu identidad de marca.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-body">
            <h4>Crear categorías y secciones</h4>
            <p>Organiza tu contenido creando categorías dentro del espacio. Cada categoría puede tener múltiples secciones anidadas.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-body">
            <h4>Publicar artículos</h4>
            <p>Crea artículos usando el editor de bloques. Soporta Markdown, código, tablas, callouts e imágenes.</p>
          </div>
        </div>
      </div>

      <h2>Atajos de acceso rápido</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-icon">📚</div>
          <h4>Guías de inicio</h4>
          <p>Todo lo que necesitas para empezar en menos de 30 minutos.</p>
        </div>
        <div class="card">
          <div class="card-icon">🔌</div>
          <h4>API Reference</h4>
          <p>Documentación completa de endpoints REST y GraphQL.</p>
        </div>
        <div class="card">
          <div class="card-icon">🛠️</div>
          <h4>Plugins</h4>
          <p>Extiende la plataforma con plugins oficiales y de la comunidad.</p>
        </div>
        <div class="card">
          <div class="card-icon">🚀</div>
          <h4>Deploy</h4>
          <p>Guías de despliegue en Docker, VPS, y servicios en la nube.</p>
        </div>
      </div>

      <h2>Listas y elementos de contenido</h2>
      <h3>Lista desordenada</h3>
      <ul>
        <li>Soporte multi-tenant con espacios de documentación independientes</li>
        <li>Tema visual completamente personalizable por espacio</li>
        <li>Editor de bloques rico con soporte de código, tablas y callouts</li>
        <li>Ciclo de vida completo en artículos con hooks de validación</li>
      </ul>

      <h3>Lista ordenada</h3>
      <ol>
        <li>Instalar dependencias con <code>npm install</code></li>
        <li>Configurar variables de entorno en <code>.env</code></li>
        <li>Ejecutar migraciones con <code>npm run develop</code></li>
        <li>Acceder al admin en <code>localhost:1337/admin</code></li>
      </ol>

      <hr />

      <h2>Acciones disponibles</h2>
      <div class="btn-group">
        <button class="btn btn-primary">Comenzar ahora</button>
        <button class="btn btn-secondary">Ver ejemplos</button>
        <button class="btn btn-ghost">Leer más →</button>
        <button class="btn btn-primary btn-sm">Acción pequeña</button>
        <button class="btn btn-secondary btn-sm">Cancelar</button>
      </div>

      <p>¿Tienes dudas? Consulta la <a href="#">referencia completa de la API</a> o revisa los <a href="#">ejemplos en GitHub</a>.</p>

    </main>

    <!-- Table of contents -->
    <aside class="toc">
      <div class="toc-title">En esta página</div>
      <a class="toc-link active" href="#">Introducción</a>
      <a class="toc-link" href="#">Encabezados</a>
      <a class="toc-link" href="#">Tipografía</a>
      <a class="toc-link" href="#">Bloques de código</a>
      <a class="toc-link" href="#">Variables de entorno</a>
      <a class="toc-link" href="#">Pasos de configuración</a>
      <div class="toc-sub">
        <a class="toc-link" href="#">Crear espacio</a>
        <a class="toc-link" href="#">Configurar tema</a>
        <a class="toc-link" href="#">Categorías</a>
        <a class="toc-link" href="#">Artículos</a>
      </div>
      <a class="toc-link" href="#">Atajos</a>
      <a class="toc-link" href="#">Listas</a>
      <a class="toc-link" href="#">Acciones</a>
    </aside>

  </div>

  <footer class="footer">
    <span>${footerText}</span>
    <span>Documentation Platform &mdash; Strapi v5</span>
  </footer>

</body>
</html>`;
}
