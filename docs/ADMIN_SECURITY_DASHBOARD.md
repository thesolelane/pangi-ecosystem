# Admin Security Dashboard

## Overview

The Security Dashboard provides a web-based interface for monitoring and verifying PANGI ecosystem security features.

---

## Access

**URL:** `/admin/security`

**Example:** `https://your-domain.com/admin/security`

---

## Features

### 🔍 One-Click Security Verification

Run comprehensive security checks with a single click:
- Project structure validation
- Security documentation verification
- Build artifacts check
- Security features implementation status
- Frontend security features

### 📊 Visual Dashboard

- **Summary Cards** - Quick overview of passed/warned/failed checks
- **Detailed Results** - Expandable details for each check
- **Color-Coded Status** - Easy visual identification
- **Missing Features List** - Clear indication of what needs attention
- **Suggestions** - Actionable recommendations

### 🔒 Security Features

- **Rate Limiting** - Prevents spam (1 check per minute per IP)
- **Path Traversal Protection** - Safe file access only
- **File Type Whitelist** - Only reads allowed file types
- **File Size Limits** - Prevents DoS attacks (10MB max)
- **Read-Only Operations** - No modifications to files

---

## Usage

### Running a Security Check

1. Navigate to `/admin/security`
2. Click "🔍 Run Security Check" button
3. Wait for results (typically 1-2 seconds)
4. Review the dashboard

### Understanding Results

#### Status Icons

- ✅ **PASS** - Check passed successfully
- ⚠️ **WARN** - Check passed but with warnings
- ❌ **FAIL** - Check failed, action required
- ❓ **ERROR** - Check encountered an error

#### Summary Cards

**Passed (Green)**
- All checks that passed successfully
- No action required

**Warnings (Yellow)**
- Non-critical issues
- Should be addressed but not blocking

**Failed (Red)**
- Critical issues
- Must be addressed before deployment

**Total**
- Total number of checks performed

#### Detailed Results

Each check shows:
- **Name** - What was checked
- **Status** - Pass/Warn/Fail
- **Details** - Summary of findings
- **Missing Features** - List of unimplemented features (if any)
- **Suggestions** - Recommendations for fixes

---

## Checks Performed

### 1. Project Structure ✅

Verifies all required files exist:
- `Anchor.toml`
- `package.json`
- `Cargo.toml`
- Program source files
- Security documentation

**Pass Criteria:** All required files present

### 2. Security Documentation ✅

Verifies security documentation exists:
- `SECURITY_INDEX.md`
- `SECURITY_ANALYSIS.md`
- `SECURITY_CHECKLIST.md`
- `SECURITY_FIXES_IMPLEMENTED.md`
- `TRANSACTION_SECURITY_GUIDE.md`

**Pass Criteria:** All 5 core documents present

### 3. Build Artifacts ⚠️

Checks for compiled program artifacts:
- `target/idl/pangi_token.json`
- `target/idl/pangi_vault.json`
- `target/idl/pangi_nft.json`

**Pass Criteria:** At least 1 IDL file present  
**Suggestion:** Run `anchor build` if missing

### 4. Security Features 🔒

Checks for security patterns in smart contracts:

**Token Program:**
- Slippage protection
- Overflow protection
- Timelocks
- Input validation

**Vault Program:**
- Reentrancy guards
- Reward caps
- Access control

**NFT Program:**
- Evolution cooldown

**Pass Criteria:** All 8 features implemented  
**Warn Criteria:** 70%+ features implemented  
**Fail Criteria:** <70% features implemented

### 5. Frontend Security 🌐

Checks for security features in frontend:
- Transaction simulation
- Transaction preview
- Error handling
- Input validation

**Pass Criteria:** All 4 features implemented  
**Warn Criteria:** 50%+ features implemented  
**Fail Criteria:** <50% features implemented

---

## API Endpoint

### POST `/api/security/verify`

Runs security verification and returns results.

**Request:**
```bash
curl -X POST https://your-domain.com/api/security/verify \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "timestamp": 1704672000000,
  "checks": [
    {
      "name": "Project Structure",
      "status": "PASS",
      "details": "All required files present"
    },
    {
      "name": "Security Features",
      "status": "WARN",
      "details": "6/8 features implemented",
      "missing": ["Timelocks", "Reward Caps"]
    }
  ],
  "summary": {
    "passed": 3,
    "warnings": 2,
    "failed": 0,
    "total": 5
  }
}
```

**Rate Limiting:**
- 1 request per minute per IP
- Returns 429 status if exceeded

**Error Responses:**
```json
{
  "error": "Please wait 45 seconds before running again"
}
```

---

## Integration

### Adding to Navigation

```tsx
// In your admin layout or navigation
<Link href="/admin/security">
  🔒 Security Dashboard
</Link>
```

### Embedding in Dashboard

```tsx
import SecurityDashboard from '@/components/SecurityDashboard';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <SecurityDashboard />
    </div>
  );
}
```

### Custom Styling

The component uses inline styles for portability. To customize:

```tsx
// Wrap in a styled container
<div className="custom-security-dashboard">
  <SecurityDashboard />
</div>
```

---

## Automation

### Scheduled Checks

Run automated checks using cron or GitHub Actions:

```yaml
# .github/workflows/security-check.yml
name: Daily Security Check

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/verify-security.js
```

### Webhook Integration

Call the API endpoint from external services:

```javascript
// Example: Slack notification
const response = await fetch('https://your-domain.com/api/security/verify', {
  method: 'POST'
});

const data = await response.json();

if (data.summary.failed > 0) {
  await sendSlackNotification({
    text: `⚠️ Security check failed: ${data.summary.failed} issues found`
  });
}
```

---

## Troubleshooting

### "Please wait X seconds before running again"

**Cause:** Rate limiting is active  
**Solution:** Wait the specified time or clear rate limit cache

### "Failed to run security check"

**Cause:** API endpoint error  
**Solution:** 
1. Check browser console for details
2. Verify API route exists at `/api/security/verify/route.ts`
3. Check server logs

### "Missing required files"

**Cause:** Project structure incomplete  
**Solution:** 
1. Run `anchor build` to generate IDL files
2. Ensure all programs are in `programs/` directory
3. Verify security documentation in `docs/`

### "Security features not implemented"

**Cause:** Code patterns not found in programs  
**Solution:**
1. Review the specific feature mentioned
2. Check corresponding security review document
3. Implement missing patterns from documentation

---

## Security Considerations

### Access Control

**⚠️ Important:** This dashboard should be protected!

Add authentication:

```tsx
// app/admin/security/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function SecurityPage() {
  const session = await getServerSession();
  
  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }
  
  return <SecurityDashboard />;
}
```

### Rate Limiting

Current implementation uses in-memory storage. For production:

```typescript
// Use Redis or database for distributed rate limiting
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Check rate limit
const key = `security-check:${clientIp}`;
const lastRun = await redis.get(key);
// ... rate limit logic
await redis.set(key, Date.now(), { ex: 60 });
```

### Logging

Add audit logging:

```typescript
// Log all security checks
await db.securityAudit.create({
  data: {
    timestamp: new Date(),
    ip: clientIp,
    user: session?.user?.id,
    results: checks,
  }
});
```

---

## Customization

### Adding Custom Checks

Edit `/app/api/security/verify/route.ts`:

```typescript
class SecurityVerifier {
  // Add new check method
  checkCustomFeature(): SecurityCheck {
    // Your check logic
    return {
      name: 'Custom Feature',
      status: 'PASS',
      details: 'Feature is implemented'
    };
  }

  runAllChecks(): SecurityCheck[] {
    return [
      // ... existing checks
      this.checkCustomFeature()
    ];
  }
}
```

### Customizing UI

Edit `/components/SecurityDashboard.tsx`:

```tsx
// Change colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PASS': return '#your-color';
    // ...
  }
};

// Add custom sections
<div style={{ /* your styles */ }}>
  Custom content
</div>
```

---

## Best Practices

### Regular Monitoring

- Run checks before each deployment
- Schedule daily automated checks
- Review warnings promptly
- Track trends over time

### Team Workflow

1. **Developer** - Run check before committing
2. **Code Review** - Verify checks pass
3. **CI/CD** - Automated check in pipeline
4. **Deployment** - Final check before deploy
5. **Monitoring** - Regular checks in production

### Documentation

- Keep security docs up to date
- Document any custom checks added
- Maintain changelog of security improvements
- Share results with team

---

## Resources

### Documentation
- [SECURITY_INDEX.md](./SECURITY_INDEX.md) - Complete security docs
- [SECURITY_IMPLEMENTATION_STATUS.md](./SECURITY_IMPLEMENTATION_STATUS.md) - Implementation status
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Development checklist

### Code
- `/components/SecurityDashboard.tsx` - Dashboard component
- `/app/api/security/verify/route.ts` - API endpoint
- `/scripts/verify-security.js` - CLI version

---

## Support

For issues or questions:
1. Check this documentation
2. Review security documentation in `docs/`
3. Check GitHub issues
4. Contact PANGI security team

---

**Last Updated:** 2025-01-07  
**Version:** 1.0  
**Status:** Production Ready
