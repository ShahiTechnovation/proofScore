# Vercel Deployment Guide for ProofScore

## 🚀 Quick Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import from GitHub**
   - Select "Import Git Repository"
   - Choose: `ShahiTechnovation/proofScore`
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `proofscore` (lowercase)
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (Optional for now)
   ```
   NEXT_PUBLIC_ALEO_RPC=https://api.explorer.aleo.org/v1
   NEXT_PUBLIC_CONTRACT_ADDRESS=credit_score.aleo
   NEXT_PUBLIC_CHAIN_ID=testnet
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get your live URL: `https://proofscore.vercel.app`

---

### Option 2: Vercel CLI (Alternative)

If you prefer CLI deployment:

```bash
# 1. Login to Vercel
vercel login

# 2. Link project (first time only)
vercel link

# 3. Deploy to production
vercel --prod

# 4. Set environment variables
vercel env add NEXT_PUBLIC_ALEO_RPC production
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production
vercel env add NEXT_PUBLIC_CHAIN_ID production
```

---

## 🔧 Troubleshooting

### Build Fails with "npm install exited with 1"

**Solution**: The `.npmrc` file should handle this, but if it persists:

1. Go to Vercel Dashboard → Project Settings
2. Under "Build & Development Settings"
3. Override Install Command:
   ```
   npm install --legacy-peer-deps
   ```

### Build Fails with TypeScript Errors

**Solution**: Already handled in `next.config.mjs`:
- `typescript.ignoreBuildErrors: true`
- `eslint.ignoreDuringBuilds: true`

### Build Fails with Turbopack Error

**Solution**: The build command doesn't use Turbopack, but if needed:
```json
{
  "scripts": {
    "build": "next build --no-turbo"
  }
}
```

---

## ✅ Post-Deployment Checklist

After successful deployment:

1. **Test the Live Site**
   - Visit your Vercel URL
   - Check landing page loads
   - Test navigation
   - Verify animations work

2. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add: `proofscore.io` or your domain
   - Update DNS records

3. **Enable Analytics**
   - Vercel Analytics (automatic)
   - Web Vitals tracking (automatic)

4. **Set up GitHub Auto-Deploy**
   - Already configured via Vercel GitHub integration
   - Every push to `main` = automatic deployment

---

## 📊 Expected Build Output

Successful build should show:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /dashboard                           8.1 kB         150 kB
└ ○ /_not-found                          871 B          85.2 kB

○  (Static)  prerendered as static content

✓ Build completed in 45s
```

---

## 🌐 Live URLs

After deployment, you'll get:

- **Production**: `https://proofscore.vercel.app`
- **Preview** (per commit): `https://proofscore-git-[branch]-[user].vercel.app`
- **Inspect**: `https://vercel.com/[user]/proofscore/[deployment-id]`

---

## 🚨 Current Known Issues

1. **Build Error**: Baseline browser mapping issue
   - **Status**: Investigating
   - **Workaround**: Use GitHub integration (auto-deploys)

2. **Peer Dependencies**: Resolved with `.npmrc`
   - **Status**: ✅ Fixed

3. **TypeScript Errors**: Temporarily ignored
   - **Status**: ⚠️ TODO: Fix before final production

---

## 📝 Next Steps

1. **Deploy via GitHub Integration** (recommended)
2. **Test live site**
3. **Configure custom domain**
4. **Enable monitoring**
5. **Continue Stage 5 development**

---

**Last Updated**: 2026-01-30  
**Status**: Ready for GitHub-based deployment
