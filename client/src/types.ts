export interface ScanOptions {
  targetUrl: string;
  maxDepth: number;
  maxPages: number;
  timeout: number;
  concurrency: number;
}

export interface ScanResource {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  contentType: string;
  responseSize: number;
  depth: number;
  sourceUrl: string;
  discoveryMethod: string;
  timestamp: string;
  type: 'Pages' | 'API' | 'Authentication' | 'Assets' | 'Other';
  statusType: 'Accessible' | 'Redirect' | 'Forbidden' | 'Not Found' | 'Server Error' | 'Referenced';
  headers?: Record<string, string>;
}

export interface TechnologyItem {
  name: string;
  evidence: string;
  confidence: 'Low' | 'Medium' | 'High';
}

export interface ScanLog {
  timestamp: string;
  message: string;
}

export interface TimelineEvent {
  timestamp: string;
  message: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  category: string;
  severity: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk' | 'Ignored' | 'Reviewed';
  url: string;
  evidence: {
    url: string;
    status?: number;
    header?: string;
    rule: string;
    reason: string;
    snippet?: string;
  };
  description: string;
  impact: string;
  remediation: string;
  detectedAt: string;
  reason?: string;
  note?: string;
}

export interface SecurityReport {
  id: string;
  scanId: string;
  targetUrl: string;
  createdAt: string;
  format: 'HTML' | 'JSON' | 'CSV';
  filePath: string;
}

export interface ScanResultData {
  id: string;
  targetUrl: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'STOPPED' | 'ERROR';
  startTime: string;
  endTime?: string;
  duration: number;
  options: ScanOptions;
  resources: ScanResource[];
  technologies: TechnologyItem[];
  logs: ScanLog[];
  timeline: TimelineEvent[];
  findings: SecurityFinding[];
  auditStatus: 'IDLE' | 'RUNNING' | 'COMPLETED';
  stats: {
    pages: number;
    endpoints: number;
    api: number;
    javascript: number;
    css: number;
    images: number;
    forms: number;
    technologies: number;
    findingsCount: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
  };
}

export interface ScanHistoryItem {
  id: string;
  targetUrl: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: string;
  pagesCount: number;
  endpointsCount: number;
  findingsCount: number;
}
