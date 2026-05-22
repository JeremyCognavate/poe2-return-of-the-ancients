import { execSync } from 'node:child_process';
process.env.CLOUDFLARE_ACCOUNT_ID = '040749147cf800a34750683743e36b0a';
execSync('npx wrangler pages deploy dist/ --project-name blood-of-mages', { stdio: 'inherit' });
