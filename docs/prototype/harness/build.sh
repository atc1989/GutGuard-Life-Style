#!/bin/bash
# Builds the member-page test harness (run from the repo root): bash docs/prototype/harness/build.sh
set -e
H=docs/prototype/harness
npx --yes esbuild@0.25.0 $H/entry.jsx --bundle --outfile=$H/bundle.js --jsx=automatic --loader:.js=jsx \
  --define:process.env.NEXT_PUBLIC_PROTOTYPE_DEMO='""' --define:process.env.NEXT_PUBLIC_WEBSITE_URL='"https://gutguard.ph"' \
  --define:process.env.NEXT_PUBLIC_SITE_URL='"https://lifestyle.gutguard.ph"' --define:process.env.NODE_ENV='"production"' \
  --alias:@/lib/actions/member=./$H/stub_member.js --alias:@/lib/actions/lifestyle=./$H/stub_lifestyle.js --log-level=warning
echo "built $H/bundle.js"
