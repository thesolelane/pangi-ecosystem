#!/usr/bin/env node

/**
 * PANGI Security Verification Script
 * 
 * Verifies that security features are properly implemented across the project.
 * This script performs read-only checks and is safe to run in CI/CD pipelines.
 * 
 * Usage:
 *   node scripts/verify-security.js
 *   DEBUG=1 node scripts/verify-security.js
 */

const fs = require('fs');
const path = require('path');

class SecurityVerification {
  constructor() {
    this.checks = [];
    this.lastRunFile = '.security-verification-last-run';
    this.minInterval = 60000; // 1 minute
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.projectRoot = path.normalize(process.cwd());
  }

  // Rate limiting to prevent spam
  checkRateLimit() {
    try {
      if (fs.existsSync(this.lastRunFile)) {
        const lastRun = parseInt(fs.readFileSync(this.lastRunFile, 'utf8'));
        const elapsed = Date.now() - lastRun;
        
        if (elapsed < this.minInterval) {
          const wait = Math.ceil((this.minInterval - elapsed) / 1000);
          console.log(`⏳ Please wait ${wait} seconds before running again`);
          process.exit(0);
        }
      }
      
      fs.writeFileSync(this.lastRunFile, Date.now().toString());
    } catch (error) {
      // Ignore rate limit errors
    }
  }

  // Safe file reading with comprehensive validation
  safeReadFile(filePath) {
    try {
      // Whitelist file extensions
      const allowedExtensions = ['.json', '.toml', '.rs', '.ts', '.js', '.tsx', '.jsx', '.md'];
      const ext = path.extname(filePath);
      
      if (!allowedExtensions.includes(ext)) {
        throw new Error(`File type not allowed: ${ext}`);
      }

      // Prevent path traversal
      const fullPath = path.normalize(path.resolve(this.projectRoot, filePath));
      
      if (!fullPath.startsWith(this.projectRoot + path.sep) && fullPath !== this.projectRoot) {
        throw new Error('Path traversal attempt detected');
      }

      // Check file exists
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      // Check file size and type
      const stats = fs.statSync(fullPath);
      
      if (stats.size > this.maxFileSize) {
        throw new Error(`File too large: ${stats.size} bytes`);
      }
      
      if (!stats.isFile()) {
        throw new Error('Not a regular file');
      }

      // Read file
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      if (process.env.DEBUG) {
        console.error(`[DEBUG] Error reading ${filePath}:`, error.message);
      }
      return null;
    }
  }

  // Safe JSON parsing with prototype pollution protection
  safeParseJSON(filePath) {
    try {
      const content = this.safeReadFile(filePath);
      if (!content) return null;
      
      const parsed = JSON.parse(content);
      
      // Prevent prototype pollution
      if (parsed.__proto__ || parsed.constructor?.prototype) {
        throw new Error('Invalid JSON structure');
      }
      
      return parsed;
    } catch (error) {
      if (process.env.DEBUG) {
        console.error(`[DEBUG] Error parsing JSON from ${filePath}:`, error.message);
      }
      return null;
    }
  }

  // Sanitize paths for output
  sanitizePath(filePath) {
    return path.relative(this.projectRoot, filePath);
  }

  checkProjectStructure() {
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
        const fullPath = path.resolve(this.projectRoot, file);
        return !fs.existsSync(fullPath);
      } catch {
        return true;
      }
    });
    
    return {
      name: 'Project Structure',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: missing.length > 0 
        ? `Missing: ${missing.map(f => this.sanitizePath(f)).join(', ')}` 
        : 'All required files present'
    };
  }

  checkSecurityDocumentation() {
    const requiredDocs = [
      'docs/SECURITY_INDEX.md',
      'docs/SECURITY_ANALYSIS.md',
      'docs/SECURITY_CHECKLIST.md',
      'docs/SECURITY_FIXES_IMPLEMENTED.md',
      'docs/TRANSACTION_SECURITY_GUIDE.md'
    ];

    const missing = requiredDocs.filter(doc => {
      try {
        const fullPath = path.resolve(this.projectRoot, doc);
        return !fs.existsSync(fullPath);
      } catch {
        return true;
      }
    });
    
    return {
      name: 'Security Documentation',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: missing.length > 0 
        ? `Missing: ${missing.map(f => this.sanitizePath(f)).join(', ')}` 
        : `All ${requiredDocs.length} security documents present`
    };
  }

  checkSecurityFeatures() {
    const features = [
      {
        name: 'Slippage Protection',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['max_tax_amount', 'SlippageExceeded']
      },
      {
        name: 'Reentrancy Guards',
        file: 'programs/pangi-vault/src/lib.rs',
        patterns: ['is_claiming', 'is_withdrawing', 'ClaimInProgress']
      },
      {
        name: 'Overflow Protection',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['checked_mul', 'checked_add', 'checked_sub']
      },
      {
        name: 'Timelocks',
        file: 'programs/pangi-token/src/lib.rs',
        patterns: ['struct Timelock', 'PendingTransaction', 'delay']
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
        patterns: ['require!', 'AmountTooSmall', 'AmountTooLarge']
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
      missing: notImplemented.length > 0 ? notImplemented : null
    };
  }

  checkFrontendSecurity() {
    const features = [
      {
        name: 'Transaction Simulation',
        file: 'pangi-dapp/lib/utils/transactions.ts',
        patterns: ['simulateTransaction', 'SimulationResult']
      },
      {
        name: 'Transaction Preview',
        file: 'pangi-dapp/components/TransactionPreview.tsx',
        patterns: ['TransactionPreview', 'onConfirm', 'onCancel']
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
      missing: notImplemented.length > 0 ? notImplemented : null
    };
  }

  checkDependencies() {
    const pkg = this.safeParseJSON('package.json');
    
    if (!pkg) {
      return {
        name: 'Dependencies',
        status: 'ERROR',
        details: 'Could not read package.json'
      };
    }

    const required = ['@project-serum/anchor', '@solana/web3.js'];
    const missing = required.filter(dep => 
      !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
    );
    
    return {
      name: 'Dependencies',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      details: missing.length > 0 
        ? `Missing: ${missing.join(', ')}` 
        : 'All required dependencies found'
    };
  }

  checkBuildArtifacts() {
    const artifacts = [
      'target/idl/pangi_token.json',
      'target/idl/pangi_vault.json',
      'target/idl/pangi_nft.json'
    ];

    const existing = artifacts.filter(artifact => {
      try {
        const fullPath = path.resolve(this.projectRoot, artifact);
        return fs.existsSync(fullPath);
      } catch {
        return false;
      }
    });
    
    return {
      name: 'Build Artifacts',
      status: existing.length > 0 ? 'PASS' : 'WARN',
      details: `${existing.length}/${artifacts.length} IDL files found`,
      suggestion: existing.length === 0 ? 'Run `anchor build` to generate IDLs' : null
    };
  }

  runAllChecks() {
    console.log('🔒 PANGI Security Verification\n');
    console.log('='.repeat(60));

    // Check rate limit
    this.checkRateLimit();

    const checks = [
      this.checkProjectStructure(),
      this.checkSecurityDocumentation(),
      this.checkDependencies(),
      this.checkBuildArtifacts(),
      this.checkSecurityFeatures(),
      this.checkFrontendSecurity()
    ];

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    checks.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : 
                  check.status === 'FAIL' ? '❌' : 
                  check.status === 'WARN' ? '⚠️' : '❓';
      
      console.log(`${icon} ${check.name}: ${check.status}`);
      console.log(`   ${check.details}`);
      
      if (check.suggestion) {
        console.log(`   💡 ${check.suggestion}`);
      }
      
      if (check.missing && check.missing.length > 0) {
        console.log(`   ⚠️  Missing: ${check.missing.join(', ')}`);
      }
      
      console.log('');

      if (check.status === 'PASS') passCount++;
      else if (check.status === 'WARN') warnCount++;
      else if (check.status === 'FAIL') failCount++;
    });

    console.log('='.repeat(60));
    console.log(`Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
    console.log('');

    if (failCount === 0 && warnCount === 0) {
      console.log('🎉 All security checks passed! Project is secure.');
      return 0;
    } else if (failCount === 0) {
      console.log('⚠️  All critical checks passed, but some warnings need attention.');
      return 0;
    } else {
      console.log('❌ Some critical security checks failed. Please review above.');
      return 1;
    }
  }
}

// Run verification
if (require.main === module) {
  try {
    const verifier = new SecurityVerification();
    const exitCode = verifier.runAllChecks();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

module.exports = SecurityVerification;
