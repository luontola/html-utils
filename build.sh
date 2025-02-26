#!/usr/bin/env bash
set -euxo pipefail

npm run lint
npm run test:run
