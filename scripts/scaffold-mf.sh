#!/usr/bin/env bash
# Adds webpack Module Federation to the already-generated workspace in ./.ngtmp/eisfe.
# Angular 21 generates apps on the new @angular/build:application builder, which the
# webpack init-webpack schematic cannot convert. So we first rewrite each app's build/serve
# targets to the classic @angular-devkit/build-angular browser builder, then run init-webpack
# (which switches them to ngx-build-plus + adds webpack.config.js).
set -euo pipefail
NG=21
MF="@angular-architects/module-federation@21"

cd /work/.ngtmp/eisfe

echo "### ensure MF plugin + ngx-build-plus installed"
npm install -D "${MF}" ngx-build-plus --no-audit --no-fund

echo "### rewrite build/serve targets to classic browser builder"
node - <<'NODE'
const fs = require('fs');
const f = 'angular.json';
const j = JSON.parse(fs.readFileSync(f, 'utf8'));
for (const name of Object.keys(j.projects)) {
  const p = j.projects[name];
  const root = p.root || `apps/${name}`;
  const src = p.sourceRoot || `${root}/src`;
  p.architect.build = {
    builder: '@angular-devkit/build-angular:browser',
    options: {
      outputPath: `dist/${name}`,
      index: `${src}/index.html`,
      main: `${src}/main.ts`,
      polyfills: [],
      tsConfig: `${root}/tsconfig.app.json`,
      inlineStyleLanguage: 'scss',
      assets: [{ glob: '**/*', input: `${root}/public` }],
      styles: [`${src}/styles.scss`],
      scripts: [],
    },
    configurations: {
      production: {
        budgets: [
          { type: 'initial', maximumWarning: '1mb', maximumError: '2mb' },
          { type: 'anyComponentStyle', maximumWarning: '4kb', maximumError: '8kb' },
        ],
        outputHashing: 'all',
        optimization: true,
      },
      development: { optimization: false, sourceMap: true, namedChunks: true },
    },
    defaultConfiguration: 'production',
  };
  p.architect.serve = {
    builder: '@angular-devkit/build-angular:dev-server',
    configurations: {
      production: { buildTarget: `${name}:build:production` },
      development: { buildTarget: `${name}:build:development` },
    },
    defaultConfiguration: 'development',
  };
}
fs.writeFileSync(f, JSON.stringify(j, null, 2));
console.log('rewrote builders for:', Object.keys(j.projects).join(', '));
NODE

echo "### init-webpack — shell (dynamic-host, manifest-based)"
npx -y "@angular/cli@${NG}" generate @angular-architects/module-federation:init-webpack \
  --project shell --type dynamic-host --port 4200 --skip-confirmation

echo "### init-webpack — profile-mfe (remote)"
npx -y "@angular/cli@${NG}" generate @angular-architects/module-federation:init-webpack \
  --project profile-mfe --type remote --port 4201 --skip-confirmation

echo "### RESULT builders"
node -e "const j=require('./angular.json');for(const p of Object.keys(j.projects)){const a=j.projects[p].architect;console.log(p,'build=',a.build.builder,'serve=',a.serve?.builder)}"
echo "### MF artifacts"
ls -la apps/shell/webpack.config.js apps/profile-mfe/webpack.config.js apps/shell/public/mf.manifest.json 2>&1 || true
ls apps/shell/src/main.ts apps/shell/src/bootstrap.ts apps/profile-mfe/src/bootstrap.ts 2>&1 || true
echo "### profile-mfe webpack (exposes)"; sed -n '1,80p' apps/profile-mfe/webpack.config.js 2>&1 || true
echo "### DONE"
