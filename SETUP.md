# Daily Auto-Refresh Setup

The site re-scrapes PoE2DB and redeploys to Cloudflare Pages every day at 06:00 UTC via GitHub Actions.

## One-Time Setup

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin master
```

### 2. Add Cloudflare Secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with **Cloudflare Pages: Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (found in the right sidebar of the Cloudflare dashboard) |

### 3. Enable Write Permissions

In your GitHub repo: **Settings → Actions → General → Workflow permissions**

Select **"Read and write permissions"** and save.

### 4. Test the Workflow

Go to **Actions tab → Daily Refresh → Run workflow** to trigger a manual run and verify everything works end-to-end.

## Adding Teasers

When a new YouTube teaser drops, run:

```bash
node scripts/add-teaser.mjs --url "https://www.youtube.com/watch?v=..." --summary "Brief description of what the teaser reveals"
```

Then rebuild and deploy:

```bash
pnpm deploy
```

## Post-Launch Note

After the 29 May 2026 launch, re-run `pnpm scrape` to pick up any new items that weren't in the datamine. Seven uniques that were missing icons at plan time (Facebreaker, Nightfall, Redemption, Reverie, Serles Grit, The Auspex, The Unleashed) should be checked.
