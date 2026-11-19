# Setup Guide: Google Indexing API & Auto-Updating Public GitHub Repo

Your 6-hour workflow (`.github/workflows/sync-jobs.yml`) is already wired for both features and runs safely even before secrets are added. Complete these two 5-minute setups in GitHub to activate live pushes.

---

## 1. Enable Instant Google Indexing API Pings (`JobPosting`)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and enable the **Web Search Indexing API**.
2. Go to **IAM & Admin → Service Accounts → Create Service Account** (e.g. `freshcommits-indexing-bot`).
3. Create a **JSON key** for that service account and copy the entire JSON file contents.
4. Open [Google Search Console](https://search.google.com/search-console) for `https://www.freshcommits.com/` → **Settings → Users and permissions → Add user** → paste the service account's `client_email` with **Owner** permission (required by Google Indexing API).
5. In your GitHub repo (`kartikamuthukrishnan-crypto/FreshCommit`), go to **Settings → Secrets and variables → Actions → New repository secret**:
   - **Name:** `GOOGLE_INDEXING_SA_JSON`
   - **Value:** Paste the entire JSON key (raw JSON or base64-encoded).

On the very next 6-hour run, every newly discovered job sends `URL_UPDATED` and every expired/dead job sends `URL_DELETED` to Google in real time.

---

## 2. Launch the Dedicated Auto-Updating Public GitHub Repo

Every 6 hours, your workflow regenerates `community/GITHUB_JOBS_README.md` with all live 0–2 YoE US openings and `community/WEEKLY_DROP.md` with ready-to-post Reddit, LinkedIn, and X data drops.

To automatically mirror `community/GITHUB_JOBS_README.md` as the live `README.md` of a dedicated public repo (e.g., `kartikamuthukrishnan-crypto/US-Entry-Level-SWE-Jobs-2027`):

1. Create a new **Public** repository on GitHub named `US-Entry-Level-SWE-Jobs-2027` (initialize with a README).
2. Create a GitHub **Fine-Grained Personal Access Token** (`Settings → Developer settings → Personal access tokens → Fine-grained tokens`) granted **Contents: Read and write** on `US-Entry-Level-SWE-Jobs-2027`.
3. In your main repo (`kartikamuthukrishnan-crypto/FreshCommit`), add two Actions secrets under **Settings → Secrets and variables → Actions**:
   - **Name:** `PUBLIC_JOBS_REPO` → **Value:** `kartikamuthukrishnan-crypto/US-Entry-Level-SWE-Jobs-2027`
   - **Name:** `PUBLIC_JOBS_REPO_TOKEN` → **Value:** *(paste your fine-grained PAT)*

Every 6 hours after updating `public/data/jobs.json`, GitHub Actions will automatically commit and push the refreshed table to your public repo's `README.md`!
