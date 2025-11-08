import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, normalize, extname, relative } from 'path';

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.json', '.toml', '.rs', '.ts', '.js', '.tsx', '.jsx', '.md'];

// Rate limiting (in-memory, simple implementation)
const lastRunTimes = new Map<string, number>();
const MIN_INTERVAL = 60000; // 1 minute

interface SecurityCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'ERROR';
  details: string;
  missing?: string[];
  suggestion?: string;
}

class SecurityVerifier {
  private projectRoot: string;

  constructor() {
    // Get project root (go up from pangi-dapp/app/api/security/verify)
    this.projectRoot = resolve(process.cwd(), '../..');
  }

  // Safe file reading with validation
  private safeReadFile(filePath: string): string | null {
    try {
      const ext = extname(filePath);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return null;
      }

      const fullPath = normalize(resolve(this.projectRoot, filePath));
      
      if (!fullPath.startsWith(this.projectRoot)) {
        return null;
      }

      if (!existsSync(fullPath)) {
        return null;
      }

      const stats = statSync(fullPath);
      if (stats.size > MAX_FILE_SIZE || !stats.isFile()) {
        return null;
      }

      return readFileSync(fullPath, 'utf8');
    } catch {
      return null;
    }
  }

  checkProjectStructure(): SecurityCheck {
    const requiredFiles = [
      'Anchor.toml',
      'package.json',
      'Cargo.toml',
      'programs/pangi-token/src/lib.rs',
      'programs/pangi-vault/src/lib.rs',
      'programs/pangi-nft/src/lib.rs',
      'docs/SECURITY_INDEX.md'
    ];

    const missing = requiredFiles.filter(file => {
      try {
        const fullPath = resolve(this.projectRoot, file);
        return !existsSync(fullPath);
      } catch {
        return true;
      }
    });
    
    return {
      name: 'Project Structure',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: missing.length > 0 
        ? `Missing ${missing.length} required files` 
        : 'All required files present',
      missing: missing.length > 0 ? missing : undefined
    };
  }

  checkSecurityDocumentation(): SecurityCheck {
    const requiredDocs = [
      'docs/SECURITY_INDEX.md',
      'docs/SECURITY_ANALYSIS.md',
      'docs/SECURITY_CHECKLIST.md',
      'docs/SECURITY_FIXES_IMPLEMENTED.md',
      'docs/TRANSACTION_SECURITY_GUIDE.md'
    ];

    const missing = requiredDocs.filter(doc => {
      try {
        const fullPath = resolve(this.projectRoot, doc);
        return !existsSync(fullPath);
      } catch {
        return true;
      }
    });
    
    return {
      name: 'Security Documentation',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: missing.length > 0 
        ? `Missing ${missing.length} security documents` 
        : `All ${requiredDocs.length} security documents present`,
      missing: missing.length > 0 ? missing : undefined
    };
  }

  checkSecurityFeatures(): SecurityCheck {
    const features = [
      {
        name: 'Slippage Protection',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['max_tax_amount', 'SlippageExceeded']
      },
      {
        name: 'Reentrancy Guards',
        file: 'programs/pangi-vault/src/lib.rs',
        patterns: ['is_claiming', 'is_withdrawing']
      },
      {
        name: 'Overflow Protection',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['checked_mul', 'checked_add', 'checked_sub']
      },
      {
        name: 'Timelocks',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['struct Timelock', 'PendingTransaction']
      },
      {
        name: 'Reward Caps',
        file: 'programs/pangi-vault/src/lib.rs', 
        patterns: ['max_daily_rewards', 'daily_rewards_issued']
      },
      {
        name: 'Evolution Cooldown',
        file: 'programs/pangi-nft/src/lib.rs',
        patterns: ['last_evolution_time', 'cooldown_period']
      },
      {
        name: 'Access Control',
        file: 'programs/pangi-vault/src/lib.rs',
        patterns: ['has_one = authority', 'Unauthorized']
      },
      {
        name: 'Input Validation',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['require!', 'AmountTooSmall']
      }
    ];

    const results = features.map(feature => {
      const content = this.safeReadFile(feature.file);
      if (!content) {
        return { name: feature.name, implemented: false };
      }

      const implemented = feature.patterns.every(pattern => 
        content.includes(pattern)
      );

      return { name: feature.name, implemented };
    });

    const implementedCount = results.filter(r => r.implemented).length;
    const notImplemented = results.filter(r => !r.implemented).map(r => r.name);

    return {
      name: 'Security Features',
      status: implementedCount === features.length ? 'PASS' : 
              implementedCount >= features.length * 0.7 ? 'WARN' : 'FAIL',
      details: `${implementedCount}/${features.length} features implemented`,
      missing: notImplemented.length > 0 ? notImplemented : undefined
    };
  }

  checkFrontendSecurity(): SecurityCheck {
    const features = [
      {
        name: 'Transaction Simulation',
        file: 'pangi-dapp/lib/utils/transactions.ts',
        patterns: ['simulateTransaction', 'SimulationResult']
      },
      {
        name: 'Transaction Preview',
        file: 'pangi-dapp/components/TransactionPreview.tsx',
        patterns: ['TransactionPreview', 'onConfirm']
      },
      {
        name: 'Error Handling',
        file: 'pangi-dapp/lib/utils/transactions.ts',
        patterns: ['formatTransactionError', 'try', 'catch']
      },
      {
        name: 'Input Validation',
        file: 'pangi-dapp/lib/utils/transactions.ts',
        patterns: ['validateTransaction', 'validation']
      }
    ];

    const results = features.map(feature => {
      const content = this.safeReadFile(feature.file);
      if (!content) {
        return { name: feature.name, implemented: false };
      }

      const implemented = feature.patterns.every(pattern => 
        content.includes(pattern)
      );

      return { name: feature.name, implemented };
    });

    const implementedCount = results.filter(r => r.implemented).length;
    const notImplemented = results.filter(r => !r.implemented).map(r => r.name);

    return {
      name: 'Frontend Security',
      status: implementedCount === features.length ? 'PASS' : 
              implementedCount >= features.length * 0.5 ? 'WARN' : 'FAIL',
      details: `${implementedCount}/${features.length} features implemented`,
      missing: notImplemented.length > 0 ? notImplemented : undefined
    };
  }

  checkBuildArtifacts(): SecurityCheck {
    const artifacts = [
      'target/idl/pangi_token.json',
      'target/idl/pangi_vault.json',
      'target/idl/pangi_nft.json'
    ];

    const existing = artifacts.filter(artifact => {
      try {
        const fullPath = resolve(this.projectRoot, artifact);
        return existsSync(fullPath);
      } catch {
        return false;
      }
    });
    
    return {
      name: 'Build Artifacts',
      status: existing.length > 0 ? 'PASS' : 'WARN',
      details: `${existing.length}/${artifacts.length} IDL files found`,
      suggestion: existing.length === 0 ? 'Run `anchor build` to generate IDLs' : undefined
    };
  }

  runAllChecks(): SecurityCheck[] {
    return [
      this.checkProjectStructure(),
      this.checkSecurityDocumentation(),
      this.checkBuildArtifacts(),
      this.checkSecurityFeatures(),
      this.checkFrontendSecurity()
    ];
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit
    const lastRun = lastRunTimes.get(clientIp);
    if (lastRun) {
      const elapsed = Date.now() - lastRun;
      if (elapsed < MIN_INTERVAL) {
        const waitTime = Math.ceil((MIN_INTERVAL - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before running again` },
          { status: 429 }
        );
      }
    }

    // Update last run time
    lastRunTimes.set(clientIp, Date.now());

    // Run security checks
    const verifier = new SecurityVerifier();
    const checks = verifier.runAllChecks();

    // Calculate summary
    const summary = {
      passed: checks.filter(c => c.status === 'PASS').length,
      warnings: checks.filter(c => c.status === 'WARN').length,
      failed: checks.filter(c => c.status === 'FAIL' || c.status === 'ERROR').length,
      total: checks.length
    };

    return NextResponse.json({
      timestamp: Date.now(),
      checks,
      summary
    });

  } catch (error: any) {
    console.error('Security verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
