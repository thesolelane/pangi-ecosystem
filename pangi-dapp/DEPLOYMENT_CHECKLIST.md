# Netlify Deployment Checklist

## ✅ Pre-Deployment

- [x] Build succeeds locally (`npm run build`)
- [x] Static export configured (`output: "export"`)
- [x] `netlify.toml` created
- [x] All components marked as `"use client"`
- [x] PublicKey instances lazy-loaded
- [x] No server-side dependencies

## 📋 Netlify Configuration

### Build Settings

```
Base directory: pangi-dapp
Build command: npm run build
Publish directory: out
Node version: 20
```

### Files to Check

- ✅ `netlify.toml` - Build configuration
- ✅ `next.config.ts` - Static export enabled
- ✅ `lib/constants.ts` - Lazy-loaded PublicKeys
- ✅ `package.json` - All dependencies listed

## 🚀 Deployment Steps

### Method 1: Netlify UI

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure:
   - **Base directory:** `pangi-dapp`
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
5. Click "Deploy site"

### Method 2: Drag & Drop

1. Run `npm run build` locally
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `out` folder to the page
4. Site deploys instantly

### Method 3: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
cd pangi-dapp
netlify deploy --prod
```

## 🔍 Post-Deployment Verification

### 1. Check Build Logs

- Go to Netlify dashboard → Deploys
- Click on latest deploy
- Verify build completed successfully
- Check for any warnings or errors

### 2. Test the Site

Visit your deployed URL and verify:

- [ ] Page loads without errors
- [ ] Header displays with PANGI logo
- [ ] "Select Wallet" button appears
- [ ] Program information shows 4 programs
- [ ] Explorer links work
- [ ] Features section displays correctly

### 3. Test Wallet Connection

- [ ] Click "Select Wallet" button
- [ ] Wallet modal appears
- [ ] Can select Phantom/Solflare
- [ ] Wallet connects successfully
- [ ] Token balance attempts to load

### 4. Browser Console

Open DevTools (F12) and check:

- [ ] No JavaScript errors in Console
- [ ] No failed network requests
- [ ] Wallet adapter loads correctly

## 🐛 Common Issues & Solutions

### Issue: Blank Page

**Solution:**
- Check browser console for errors
- Verify build completed successfully
- Check that `out` directory was published

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Wallet button doesn't work

**Solution:**
- Ensure wallet extension is installed
- Check browser console for errors
- Verify wallet adapter CSS is loaded

### Issue: Build fails on Netlify

**Solution:**
- Check Node version is 20
- Verify all dependencies in package.json
- Check build logs for specific error
- Try building locally first

### Issue: Token balance doesn't load

**Expected behavior:**
- Shows "Connect wallet to view balance" when not connected
- Shows "0 PANGI" when connected but no tokens
- This is normal on devnet if you haven't minted tokens yet

## 📊 Expected Output

### Build Output

```
✓ Compiled successfully
✓ Generating static pages (4/4)
✓ Finalizing page optimization

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

### Deployed Site Structure

```
out/
├── index.html          # Main page
├── 404.html            # Error page
├── _next/              # Next.js assets
│   ├── static/
│   │   ├── chunks/     # JavaScript bundles
│   │   └── media/      # Fonts, images
└── *.svg               # Static assets
```

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Site loads at your Netlify URL
3. ✅ All UI elements visible
4. ✅ Wallet button functional
5. ✅ No console errors
6. ✅ Explorer links work
7. ✅ Responsive on mobile

## 📞 Getting Help

If deployment fails:

1. **Check Build Logs**
   - Netlify dashboard → Deploys → Latest deploy
   - Look for red error messages

2. **Check Browser Console**
   - F12 → Console tab
   - Look for JavaScript errors

3. **Verify Locally**
   ```bash
   npm run build
   npx serve out
   ```
   - If it works locally but not on Netlify, it's a deployment config issue

4. **Common Fixes**
   - Clear Netlify cache and redeploy
   - Verify Node version is 20
   - Check that base directory is set to `pangi-dapp`
   - Ensure publish directory is `out`

## 🔗 Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

---

**Ready to deploy!** Follow the steps above and your PANGI dApp will be live.
