# 🍼 Baby Registry — Deployment Guide (Chromebook)

Get your registry live and shareable in ~20 minutes.
No coding experience required. Everything runs in your browser — no installs needed.

---

## What you need (all free)
- A [GitHub](https://github.com) account — stores your code + runs the setup environment
- A [Supabase](https://supabase.com) account — the database where all votes/comments/items live
- A [Vercel](https://vercel.com) account — hosts your live website

---

## Step 1 — Create your GitHub repository

1. Go to [github.com](https://github.com) → sign in (or create a free account)
2. Click the **+** icon in the top right → **New repository**
3. Name it `baby-registry`
4. Keep it set to **Public** *(required for free Vercel hosting)*
5. Check **"Add a README file"** — this gives the repo something to start with
6. Click **Create repository**

---

## Step 2 — Upload your project files

1. On your new repository page, click **Add file → Upload files**
2. Unzip the `baby-registry.zip` file you downloaded from Claude
   - On a Chromebook: open the **Files** app → find the zip → right-click → **Extract all**
3. Open the extracted `baby-registry` folder — you'll see files like `package.json`, `index.html`, a `src` folder, etc.
4. Drag **all of those files and folders** into the GitHub upload area in your browser
5. Scroll down, leave the commit message as-is, and click **Commit changes**

> ⏱️ Wait a few seconds for the upload to finish. You should see all your files listed in the repository.

---

## Step 3 — Open GitHub Codespaces

This is your browser-based coding environment. Think of it as a full computer running inside a browser tab — Node.js, npm, and everything else is pre-installed.

1. On your repository page, click the green **`<> Code`** button
2. Click the **Codespaces** tab
3. Click **Create codespace on main**
4. Wait ~1 minute for it to load — a VS Code-style editor will open in your browser

> 💡 You won't need to edit any code here. You're just using the built-in terminal to run a couple of commands.

---

## Step 4 — Set up the database (Supabase)

Do this while your Codespace is loading in the background.

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up free
2. Click **New project**, name it `baby-registry`, pick a region close to you, set any database password, click **Create new project**
3. Wait ~2 minutes for it to provision
4. In the left sidebar click **SQL Editor** → **New query**
5. Go back to your GitHub repository tab, open `supabase-schema.sql`, and click the **Copy raw file** button (clipboard icon, top right of the file view)
6. Paste the entire contents into the Supabase SQL Editor and click **Run**
   - You'll see "Success. No rows returned" — that's correct ✓
   - This created all your tables and loaded all the starter data
7. In the Supabase left sidebar go to **Settings → API**
8. Save these two values somewhere handy (a Notes tab works) — you'll need them shortly:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon / public** key — a long string starting with `eyJ...`

---

## Step 5 — Add your Supabase credentials in Codespaces

Switch back to your Codespace tab (should be fully loaded now):

1. In the file explorer panel on the left, find `.env.example`
2. Right-click it → **Rename** → change the name to `.env.local`
3. Click the file to open it — it looks like this:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Replace both placeholder values with your real ones from Step 4
5. Press **Ctrl + S** to save

---

## Step 6 — Test it locally (optional but recommended)

In your Codespace, find the **Terminal** panel at the bottom.
If it's not visible, click **Terminal → New Terminal** in the top menu.

Run these two commands one at a time — press Enter after each:

```bash
npm install
```
*Installs dependencies — takes about 30 seconds. You'll see a lot of text scroll by, that's normal.*

```bash
npm run dev
```

A popup will appear saying **"Open in Browser"** — click it. Your registry should load with all the starter data. If everything looks good, go back to the Codespace and press **Ctrl + C** to stop the preview.

---

## Step 7 — Push your files to GitHub

Your `.env.local` file is listed in `.gitignore` so it will **never** be committed to GitHub — that's intentional and keeps your credentials safe. You'll add them directly to Vercel instead.

In the Codespace terminal, run these three commands:

```bash
git add .
git commit -m "Add project files"
git push
```

Your code is now fully on GitHub. You can close the Codespace tab — you won't need it again unless you make code changes in the future.

> 💡 GitHub Codespaces gives you 60 free hours per month. For this project you'll likely only use 1–2 hours total.

---

## Step 8 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub** (use the same account)
2. Click **Add New Project**
3. Find your `baby-registry` repository in the list → click **Import**
4. Scroll down to **Environment Variables** and add both of these:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Project URL from Step 4 |
   | `VITE_SUPABASE_ANON_KEY` | your anon key from Step 4 |

5. Leave everything else as the default — Vercel auto-detects Vite projects
6. Click **Deploy**

Vercel builds and deploys automatically in about 1 minute. When it's done you'll see a success screen 🎉 and a live URL like:

```
baby-registry-yourname.vercel.app
```

---

## Step 9 — Share it!

Copy that URL and send it to anyone. Every visitor can:
- Browse all categories across Baby and For Parents tabs
- Vote on recommendations — rankings update live for everyone
- Leave comments on specific brands/models
- Suggest new brands or models under any item
- Add brand new items to any category

All changes save instantly to Supabase and are visible to every visitor in real time.

---

## Updating the registry later

**To make design or content changes:**
1. Work with Claude to update `App.jsx`
2. In your GitHub repository, navigate to `src/App.jsx` → click the **pencil ✏️ edit icon**
3. Select all the existing code, paste in the new version → click **Commit changes**
4. Vercel detects the push and re-deploys automatically within ~1 minute — no action needed

**To edit data directly** (fix a typo, add an item manually, etc.):
- Supabase → **Table Editor** — a simple spreadsheet view of all your items, recommendations, and comments

---

## Optional: Custom domain

In Vercel → your project → **Settings → Domains**, you can connect a custom domain (like `weecommend.com`). You'd purchase the domain separately from a registrar like Namecheap or Google Domains for ~$12–15/year, then follow Vercel's one-page DNS setup guide.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank white page after deploy | Check both env variables are correctly set in Vercel → Settings → Environment Variables → redeploy |
| "Failed to load registry data" error | Double-check your Supabase URL and anon key — make sure there are no extra spaces |
| SQL Editor shows a red error | Make sure you copied the *entire* `supabase-schema.sql` file contents including the final line |
| Codespace won't open | Try refreshing. If it still fails, delete the codespace and create a new one |
| `npm install` fails in Codespace | Type `node -v` in the terminal — if you get an error, click the Codespace menu → **Rebuild Container** |
| Git push asks for a password | Go to GitHub → Settings → Developer Settings → Personal Access Tokens → generate one and use it as your password |

---

## Need help?

If you get stuck at any step, paste the exact error message you see into Claude along with which step you're on and I'll walk you through it.
