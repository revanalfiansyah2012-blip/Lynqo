import { ScanResultData, SecurityFinding } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class SecurityAuditEngine {
  private scanData: ScanResultData;

  constructor(scanData: ScanResultData) {
    this.scanData = scanData;
  }

  public async runAudit(): Promise<void> {
    this.scanData.auditStatus = 'RUNNING';
    const findings: SecurityFinding[] = [];

    for (const resource of this.scanData.resources) {
      if (resource.statusType === 'Referenced') continue;
      const headers = resource.headers || {};
      const url = resource.url;

      if (!headers['content-security-policy']) {
        findings.push({
          id: uuidv4(),
          title: 'Missing Security Header: Content-Security-Policy',
          category: 'Security Headers',
          severity: 'Medium',
          confidence: 'High',
          status: 'Open',
          url,
          evidence: {
            url,
            status: resource.statusCode,
            header: 'Content-Security-Policy: Missing',
            rule: 'MISSING_CSP',
            reason: 'Response does not include CSP header.'
          },
          description: 'CSP protects against XSS and injection attacks.',
          impact: 'Higher vulnerability to script injection.',
          remediation: 'Configure the Content-Security-Policy header based on application requirements.',
          detectedAt: new Date().toISOString()
        });
      }

      const setCookie = headers['set-cookie'] || headers['Set-Cookie'];
      if (setCookie) {
        const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
        if (!cookieStr.toLowerCase().includes('httponly')) {
          findings.push({
            id: uuidv4(),
            title: 'Cookie Missing HttpOnly Flag',
            category: 'Cookies',
            severity: 'Medium',
            confidence: 'High',
            status: 'Open',
            url,
            evidence: {
              url,
              status: resource.statusCode,
              header: `Set-Cookie: ${cookieStr.replace(/=([^;]+)/g, '=****************')}`,
              rule: 'COOKIE_MISSING_HTTPONLY',
              reason: 'Cookie set without HttpOnly flag.'
            },
            description: 'Cookies accessible to JavaScript increase session theft risk.',
            impact: 'Session hijacking.',
            remediation: 'Enable HttpOnly flag on cookies.',
            detectedAt: new Date().toISOString()
          });
        }
      }

      if (headers['server']) {
        findings.push({
          id: uuidv4(),
          title: 'Server Version Disclosure',
          category: 'Information Disclosure',
          severity: 'Low',
          confidence: 'High',
          status: 'Open',
          url,
          evidence: {
            url,
            status: resource.statusCode,
            header: `Server: ${headers['server']}`,
            rule: 'SERVER_VERSION_DISCLOSURE',
            reason: 'Server version disclosed.'
          },
          description: 'Version disclosure assists reconnaissance.',
          impact: 'Information disclosure.',
          remediation: 'Configure server to minimize version disclosure.',
          detectedAt: new Date().toISOString()
        });
      }
    }

    this.scanData.findings = findings;
    this.scanData.auditStatus = 'COMPLETED';

    let critical = 0, high = 0, medium = 0, low = 0, info = 0;
    for (const f of findings) {
      if (f.severity === 'Critical') critical++;
      if (f.severity === 'High') high++;
      if (f.severity === 'Medium') medium++;
      if (f.severity === 'Low') low++;
      if (f.severity === 'Info') info++;
    }
    this.scanData.stats.findingsCount = { critical, high, medium, low, info };
    this.scanData.timeline.push({ timestamp: new Date().toLocaleTimeString(), message: 'Security audit completed' });
  }
}
