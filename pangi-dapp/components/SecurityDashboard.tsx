"use client";

import { useState } from 'react';

interface SecurityCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'PENDING';
  details: string;
  missing?: string[];
  suggestion?: string;
}

interface SecurityReport {
  timestamp: number;
  checks: SecurityCheck[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}

export default function SecurityDashboard() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSecurityCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to run security check');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARN': return '⚠️';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#10b981';
      case 'FAIL': return '#ef4444';
      case 'WARN': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        borderBottom: '2px solid #9945FF',
        paddingBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: '0 0 8px 0',
        }}>
          🔒 Security Dashboard
        </h1>
        <p style={{
          color: '#6b7280',
          margin: 0,
        }}>
          Monitor and verify PANGI ecosystem security features
        </p>
      </div>

      {/* Run Check Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={runSecurityCheck}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#6b7280' : '#9945FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Running Security Check...' : '🔍 Run Security Check'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          background: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#991b1b',
            fontWeight: 600,
          }}>
            ❌ Error
          </div>
          <div style={{ color: '#7f1d1d', marginTop: '8px' }}>
            {error}
          </div>
        </div>
      )}

      {/* Report Display */}
      {report && (
        <div>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{
              padding: '20px',
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                {report.summary.passed}
              </div>
              <div style={{ color: '#065f46', fontWeight: 600 }}>
                Passed
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                {report.summary.warnings}
              </div>
              <div style={{ color: '#92400e', fontWeight: 600 }}>
                Warnings
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                {report.summary.failed}
              </div>
              <div style={{ color: '#991b1b', fontWeight: 600 }}>
                Failed
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: '#f3f4f6',
              border: '2px solid #6b7280',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                {report.summary.total}
              </div>
              <div style={{ color: '#4b5563', fontWeight: 600 }}>
                Total Checks
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div style={{
            padding: '16px',
            background: report.summary.failed === 0 
              ? (report.summary.warnings === 0 ? '#f0fdf4' : '#fef3c7')
              : '#fee2e2',
            border: `2px solid ${
              report.summary.failed === 0 
                ? (report.summary.warnings === 0 ? '#10b981' : '#f59e0b')
                : '#ef4444'
            }`,
            borderRadius: '12px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: report.summary.failed === 0 
                ? (report.summary.warnings === 0 ? '#065f46' : '#92400e')
                : '#991b1b',
            }}>
              {report.summary.failed === 0 && report.summary.warnings === 0 && '🎉 All security checks passed!'}
              {report.summary.failed === 0 && report.summary.warnings > 0 && '⚠️ All critical checks passed, but some warnings need attention.'}
              {report.summary.failed > 0 && '❌ Some critical security checks failed. Please review below.'}
            </div>
          </div>

          {/* Detailed Checks */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              fontSize: '18px',
            }}>
              Detailed Results
            </div>

            {report.checks.map((check, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  borderBottom: index < report.checks.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {getStatusIcon(check.status)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1f2937',
                    }}>
                      {check.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: getStatusColor(check.status),
                      fontWeight: 600,
                      marginTop: '4px',
                    }}>
                      {check.status}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginLeft: '36px',
                  color: '#4b5563',
                  fontSize: '14px',
                }}>
                  {check.details}
                </div>

                {check.missing && check.missing.length > 0 && (
                  <div style={{
                    marginLeft: '36px',
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fef3c7',
                    borderRadius: '6px',
                  }}>
                    <div style={{
                      fontWeight: 600,
                      color: '#92400e',
                      marginBottom: '8px',
                    }}>
                      ⚠️ Missing Features:
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: '#78350f',
                    }}>
                      {check.missing.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {check.suggestion && (
                  <div style={{
                    marginLeft: '36px',
                    marginTop: '12px',
                    padding: '12px',
                    background: '#dbeafe',
                    borderRadius: '6px',
                    color: '#1e40af',
                    fontSize: '14px',
                  }}>
                    💡 <strong>Suggestion:</strong> {check.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timestamp */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px',
          }}>
            Last checked: {new Date(report.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Info Box */}
      {!report && !loading && (
        <div style={{
          padding: '24px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            🔒
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px',
          }}>
            No Security Check Run Yet
          </div>
          <div style={{
            color: '#6b7280',
          }}>
            Click "Run Security Check" to verify all security features
          </div>
        </div>
      )}
    </div>
  );
}
