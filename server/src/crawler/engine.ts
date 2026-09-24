import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { ScanResultData, ScanResource } from '../types.js';
import { normalizeUrl, isSameDomain, categorizeResource, getStatusCategory } from './urlHelper.js';
import { detectTechnologies } from '../analyzer/techDetector.js';

export class CrawlerEngine {
  private scanData: ScanResultData;
  private visitedUrls = new Set<string>();
  private queue: { url: string; depth: number; sourceUrl: string }[] = [];
  private isRunning = false;

  constructor(scanData: ScanResultData) {
    this.scanData = scanData;
  }

  public async start() {
    this.isRunning = true;
    this.scanData.status = 'RUNNING';
    this.scanData.startTime = new Date().toISOString();
    this.scanData.timeline.push({ timestamp: new Date().toLocaleTimeString(), message: 'Scan started' });

    this.queue.push({ url: this.scanData.targetUrl, depth: 0, sourceUrl: 'User Input' });

    while (this.isRunning && this.queue.length > 0 && this.scanData.resources.length < this.scanData.options.maxPages) {
      const batchSize = Math.min(this.scanData.options.concurrency, this.queue.length);
      const batch = this.queue.splice(0, batchSize);

      await Promise.all(batch.map(async (item) => {
        if (!this.isRunning) return;
        if (this.visitedUrls.has(item.url)) return;
        if (item.depth > this.scanData.options.maxDepth) return;

        this.visitedUrls.add(item.url);
        await this.crawlUrl(item.url, item.depth, item.sourceUrl);
      }));

      await new Promise(r => setTimeout(r, 20));
    }

    if (this.isRunning) {
      this.scanData.status = 'COMPLETED';
      this.scanData.timeline.push({ timestamp: new Date().toLocaleTimeString(), message: 'Discovery completed' });
    } else {
      this.scanData.status = 'STOPPED';
    }

    this.scanData.endTime = new Date().toISOString();
    this.calculateDuration();
    this.updateStats();
  }

  public stop() {
    this.isRunning = false;
    this.scanData.status = 'STOPPED';
  }

  private async crawlUrl(url: string, depth: number, sourceUrl: string) {
    try {
      const response = await axios.get(url, {
        timeout: this.scanData.options.timeout * 1000,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: { 'User-Agent': 'Mozilla/5.0 LynQoVulnerabilityScanner/4.0' }
      });
      const contentType = response.headers['content-type'] || '';
      const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const responseSize = Buffer.byteLength(body);

      this.addResource({
        url,
        method: 'GET',
        statusCode: response.status,
        contentType,
        responseSize,
        depth,
        sourceUrl,
        discoveryMethod: depth === 0 ? 'Crawler' : 'HTML',
        headers: response.headers as Record<string, string>,
        body
      });

      const detected = detectTechnologies(response.headers as Record<string, string>, body);
      for (const d of detected) {
        if (!this.scanData.technologies.some(t => t.name === d.name)) {
          this.scanData.technologies.push(d);
        }
      }

      if (contentType.includes('text/html')) {
        const $ = cheerio.load(body);
        $('a[href], script[src]').each((_, el) => {
          const href = $(el).attr('href') || $(el).attr('src');
          if (href) {
            const normalized = normalizeUrl(href, url);
            if (normalized && isSameDomain(this.scanData.targetUrl, normalized) && !this.visitedUrls.has(normalized)) {
              this.queue.push({ url: normalized, depth: depth + 1, sourceUrl: url });
            }
          }
        });
      }
    } catch (err: any) {
      // ignore
    }
  }

  private addResource(data: any): ScanResource {
    const existing = this.scanData.resources.find(r => r.url === data.url);
    if (existing) return existing;

    const { type } = categorizeResource(data.url, data.contentType);
    const statusType = getStatusCategory(data.statusCode);

    const resource: ScanResource = {
      id: uuidv4(),
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      contentType: data.contentType,
      responseSize: data.responseSize,
      depth: data.depth,
      sourceUrl: data.sourceUrl,
      discoveryMethod: data.discoveryMethod,
      timestamp: new Date().toLocaleTimeString(),
      type,
      statusType,
      headers: data.headers || {},
      body: data.body
    };

    this.scanData.resources.push(resource);
    this.updateStats();
    return resource;
  }

  private updateStats() {
    let pages = 0, endpoints = 0, api = 0, javascript = 0, css = 0, images = 0;
    for (const r of this.scanData.resources) {
      if (r.type === 'Pages') pages++;
      if (r.type === 'API') api++;
      if (r.contentType.includes('javascript')) javascript++;
      if (r.contentType.includes('css')) css++;
      if (r.contentType.includes('image')) images++;
    }
    endpoints = this.scanData.resources.length;
    this.scanData.stats = {
      pages,
      endpoints,
      api,
      javascript,
      css,
      images,
      forms: 0,
      technologies: this.scanData.technologies.length,
      findingsCount: this.scanData.stats?.findingsCount || { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    };
  }

  private calculateDuration() {
    if (!this.scanData.startTime) return;
    const start = new Date(this.scanData.startTime).getTime();
    const end = this.scanData.endTime ? new Date(this.scanData.endTime).getTime() : Date.now();
    this.scanData.duration = Math.floor((end - start) / 1000);
  }
}
