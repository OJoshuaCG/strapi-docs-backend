/**
 * Agrega la columna custom_config (JSON) a documentation_space_settings.
 * MySQL almacena JSON como TEXT de largo sin límite; Strapi maneja serialización.
 */

'use strict';

const DEFAULT_CONFIG = JSON.stringify({
  colors: {
    light: {
      bgPrimary: '#ffffff', bgSecondary: '#f8fafc', bgSidebar: '#f1f5f9',
      textPrimary: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8',
      borderColor: '#e2e8f0', codeBg: '#f1f5f9', codeText: '#0f172a',
      calloutBg: '#eff6ff', calloutBorder: '#3b82f6',
    },
    dark: {
      bgPrimary: '#0f172a', bgSecondary: '#1e293b', bgSidebar: '#1e293b',
      textPrimary: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#475569',
      borderColor: '#334155', codeBg: '#1e293b', codeText: '#e2e8f0',
      calloutBg: '#1e3a8a', calloutBorder: '#60a5fa',
    },
    brand: { '50': '#eff6ff', '500': '#3b82f6', '900': '#1e3a8a' },
  },
  typography: {
    fontSans: 'Inter', fontMono: 'JetBrains Mono',
    baseFontSize: '16px', baseLineHeight: '1.625', headingLineHeight: '1.25',
    paragraphSpacing: '1rem', listSpacing: '0.375rem',
    headingSpacingTop: '2rem', headingSpacingBottom: '0.75rem',
  },
  spacing: {
    contentPaddingX: '1.5rem', contentPaddingY: '2rem', sectionGap: '2rem',
    headerHeight: '3.5rem', sidebarWidth: '16rem',
  },
  layout: {
    maxContentWidth: '72rem', tocWidth: '14rem',
    borderRadius: '0.5rem', codeBorderRadius: '0.5rem',
    transitionDuration: '0.2s', animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
});

/** @param {import('knex').Knex} knex */
async function up(knex) {
  const exists = await knex.schema.hasColumn('documentation_space_settings', 'custom_config');
  if (!exists) {
    await knex.schema.alterTable('documentation_space_settings', (table) => {
      table.text('custom_config').nullable();
    });
  }

  // Rellena filas existentes que no tengan custom_config
  await knex('documentation_space_settings')
    .whereNull('custom_config')
    .update({ custom_config: DEFAULT_CONFIG });
}

/** @param {import('knex').Knex} knex */
async function down(knex) {
  await knex.schema.alterTable('documentation_space_settings', (table) => {
    table.dropColumn('custom_config');
  });
}

module.exports = { up, down };
