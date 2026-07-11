const {
  shareAll,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'profile-mfe',

  exposes: {
    './Component': './apps/profile-mfe/src/app/app.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
