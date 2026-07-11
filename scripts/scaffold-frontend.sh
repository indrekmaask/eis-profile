#!/usr/bin/env bash
# Scaffolds the Angular 21 MF workspace (shell host + profile-mfe remote) inside a node:22 container.
# Generates into ./.ngtmp, then we relocate into apps/ + root. Idempotent-ish: wipes .ngtmp first.
set -euo pipefail

NG=21
MF="@angular-architects/module-federation@21"

cd /work
rm -rf .ngtmp
mkdir -p .ngtmp
cd .ngtmp

echo "### node/npm"; node -v; npm -v

echo "### ng new workspace (no app, skip install, skip git)"
npx -y "@angular/cli@${NG}" new eisfe \
  --create-application=false \
  --package-manager=npm \
  --style=scss \
  --skip-install \
  --skip-git \
  --defaults

cd eisfe
npx -y "@angular/cli@${NG}" config newProjectRoot apps

echo "### generate applications"
npx -y "@angular/cli@${NG}" generate application shell --style=scss --routing --ssr=false --defaults
npx -y "@angular/cli@${NG}" generate application profile-mfe --style=scss --routing --ssr=false --defaults

echo "### install workspace deps"
npm install --no-audit --no-fund

echo "### add Module Federation (webpack) — host + remote"
npx -y "@angular/cli@${NG}" add "${MF}" --project shell --type host --port 4200 --skip-confirmation || \
npx -y "@angular/cli@${NG}" add "${MF}" --project shell --port 4200 --skip-confirmation
npx -y "@angular/cli@${NG}" add "${MF}" --project profile-mfe --type remote --port 4201 --skip-confirmation || \
npx -y "@angular/cli@${NG}" add "${MF}" --project profile-mfe --port 4201 --skip-confirmation

echo "### RESULT: angular.json projects"
npx -y "@angular/cli@${NG}" config projects >/dev/null 2>&1 || true
node -e "const j=require('./angular.json');console.log(Object.keys(j.projects));for(const p of Object.keys(j.projects)){console.log(p,'builder=',j.projects[p].architect.build.builder)}"
echo "### webpack configs present?"
ls -la apps/shell/webpack.config.js apps/profile-mfe/webpack.config.js 2>&1 || true
echo "### DONE"
