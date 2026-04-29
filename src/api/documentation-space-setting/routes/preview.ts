export default {
  routes: [
    {
      method: 'GET',
      path: '/documentation-space-settings/preview',
      handler: 'documentation-space-setting.previewHtml',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
