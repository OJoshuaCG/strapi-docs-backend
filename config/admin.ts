import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', ''),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', ''),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: (env.array('FRONTEND_URL', ['http://localhost:5173']) as string[]).map((url) => {
        try { return new URL(url).origin; } catch { return url; }
      }),
      async handler(
        uid: string,
        { documentId, locale, status }: { documentId: string; locale?: string; status?: string },
      ) {
        const previewSecret = env('PREVIEW_SECRET', '');
        // env() devuelve el string completo incluyendo comas si hay múltiples URLs;
        // usamos env.array() y tomamos el primer elemento para evitar URL malformada
        const frontendUrl = (env.array('FRONTEND_URL', ['http://localhost:5173']) as string[])[0];

        if (!previewSecret) {
          return null;
        }

        if (uid === 'api::documentation-space-setting.documentation-space-setting') {
          // Preview servido por el mismo Strapi — muestra la página HTML de tema
          // STRAPI_URL debe apuntar a la URL pública del servidor (ej: http://localhost:1337)
          const strapiUrl = env('STRAPI_URL', `http://localhost:${env.int('PORT', 1337)}`);
          const params = new URLSearchParams({ secret: previewSecret, documentId });
          return `${strapiUrl}/api/documentation-space-settings/preview?${params.toString()}`;
        }

        const searchParams: Record<string, string> = { secret: previewSecret, documentId };
        if (locale) searchParams.locale = locale;
        if (status) searchParams.status = status;

        return `${frontendUrl}/api/preview?${new URLSearchParams(searchParams).toString()}`;
      },
    },
  },
});

export default config;
