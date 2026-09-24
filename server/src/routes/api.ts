import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ScanResultData, ScanOptions, SecurityReport } from '../types.js';
import { CrawlerEngine } from '../crawler/engine.ts';
import { SecurityAuditEngine } from '../audit/auditEngine.ts';
import { LocalStorage } from '../db/storage.ts';

const router = Router();
const appDb = LocalStorage.load();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LynQo Vulnerability API', version: '4.0.0' });
});

router.get('/scans/history', (req, res) => {
  const history = Object.values(appDb.scans).map(s => ({
    id: s.id,
    targetUrl: s.targetUrl,
    startTime: s.startTime,
    endTime: s.endTime,
    duration: s.duration,
    status: s.status,
    pagesCount: s.stats.pages,
    endpointsCount: s.stats.endpoints,
    findingsCount: s.findings.length
  }));
  res.json({ history });
});

router.post('/scans', async (req, res) => {
  const { targetUrl, maxDepth = 5, maxPages = 100, timeout = 10, concurrency = 5 } = req.body;
  if (!targetUrl) return res.status(400).json({ error: 'Target URL is required' });

  const scanId = uuidv4();
  const options: ScanOptions = { targetUrl, maxDepth, maxPages, timeout, concurrency };

  const scanData: ScanResultData = {
    id: scanId,
    targetUrl,
    status: 'PENDING',
    startTime: new Date().toISOString(),
    duration: 0,
    options,
    resources: [],
    technologies: [],
    logs: [],
    timeline: [],
    findings: [],
    auditStatus: 'IDLE',
    stats: { pages: 0, endpoints: 0, api: 0, javascript: 0, css: 0, images: 0, forms: 0, technologies: 0, findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 } }
  };

  appDb.scans[scanId] = scanData;
  LocalStorage.save(appDb);

  const engine = new CrawlerEngine(scanData);
  engine.start().then(() => {
    LocalStorage.save(appDb);
  });

  res.json({ scanId, status: 'started' });
});

router.get('/scans/:id', (req, res) => {
  const scan = appDb.scans[req.params.id];
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json(scan);
});

router.post('/scans/:id/security-audit', async (req, res) => {
  const scan = appDb.scans[req.params.id];
  if (!scan) return res.status(404).json({ error: 'Scan not found' });

  const auditEngine = new SecurityAuditEngine(scan);
  await auditEngine.runAudit();
  LocalStorage.save(appDb);
  res.json({ status: 'completed', findingsCount: scan.findings.length });
});

router.get('/reports', (req, res) => {
  res.json({ reports: Object.values(appDb.reports) });
});

router.post('/reports', (req, res) => {
  const { scanId } = req.body;
  const scan = appDb.scans[scanId];
  if (!scan) return res.status(404).json({ error: 'Scan not found' });

  const reportId = uuidv4();
  const report: SecurityReport = {
    id: reportId,
    scanId,
    targetUrl: scan.targetUrl,
    createdAt: new Date().toISOString(),
    format: 'HTML',
    filePath: `/api/reports/${reportId}/export/html`
  };

  appDb.reports[reportId] = report;
  LocalStorage.save(appDb);
  res.json(report);
});

router.delete('/reports/:id', (req, res) => {
  if (appDb.reports[req.params.id]) {
    delete appDb.reports[req.params.id];
    LocalStorage.save(appDb);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Report not found' });
});

router.get('/reports/:id/export/html', (req, res) => {
  const report = appDb.reports[req.params.id];
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const scan = appDb.scans[report.scanId];

  const html = `<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>LynQo Security Report - ${report.targetUrl}</title>
    <style>
      body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
      .container { max-width: 800px; margin: auto; background: #1e293b; padding: 30px; border-radius: 12px; }
      h1 { color: #6366f1; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px; border-bottom: 1px solid #334155; text-align: left; font-size: 14px; }
      th { color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>LYNQO VULNERABILITY</h1>
      <h2>Security Assessment Report</h2>
      <p><b>Target:</b> ${report.targetUrl}</p>
      <p><b>Scan Date:</b> ${report.createdAt}</p>
      <hr style="border-color: #334155; margin: 20px 0;">
      <h3>Executive Summary</h3>
      <p>Pages Discovered: ${scan?.stats.pages || 0}</p>
      <p>Endpoints Discovered: ${scan?.stats.endpoints || 0}</p>
      <p>Security Findings: ${scan?.findings.length || 0}</p>
      <h3>Findings</h3>
      <table>
        <tr><th>Title</th><th>Severity</th><th>Status</th></tr>
        ${scan?.findings.map(f => `<tr><td>${f.title}</td><td>${f.severity}</td><td>${f.status}</td></tr>`).join('') || ''}
      </table>
    </div>
  </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

router.get('/reports/:id/export/json', (req, res) => {
  const report = appDb.reports[req.params.id];
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const scan = appDb.scans[report.scanId];
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ scanner: 'LynQo Vulnerability', version: '4.0.0', report, scan }, null, 2));
});

router.get('/reports/:id/export/csv', (req, res) => {
  const report = appDb.reports[req.params.id];
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const scan = appDb.scans[report.scanId];
  let csv = 'ID,Title,Severity,Status,URL\n';
  scan?.findings.forEach(f => {
    csv += `"${f.id}","${f.title}","${f.severity}","${f.status}","${f.url}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

router.patch('/findings/:id/remediation', (req, res) => {
  const { status, reason } = req.body;
  for (const scan of Object.values(appDb.scans)) {
    const finding = scan.findings.find(f => f.id === req.params.id);
    if (finding) {
      finding.status = status || finding.status;
      if (reason) finding.reason = reason;
      LocalStorage.save(appDb);
      return res.json({ success: true, finding });
    }
  }
  res.status(404).json({ error: 'Finding not found' });
});

router.post('/findings/:id/verify', async (req, res) => {
  for (const scan of Object.values(appDb.scans)) {
    const finding = scan.findings.find(f => f.id === req.params.id);
    if (finding) {
      const engine = new CrawlerEngine(scan);
      await engine.start();
      const auditEngine = new SecurityAuditEngine(scan);
      await auditEngine.runAudit();
      LocalStorage.save(appDb);
      return res.json({ success: true, verified: true, scan });
    }
  }
  res.status(404).json({ error: 'Finding not found' });
});

export default router;
