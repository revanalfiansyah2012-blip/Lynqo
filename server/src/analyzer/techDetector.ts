import { TechnologyItem } from '../types.js';

export function detectTechnologies(headers: Record<string, string>, body: string): TechnologyItem[] {
  const techs: TechnologyItem[] = [];
  const serverHeader = headers['server'] || '';
  const poweredBy = headers['x-powered-by'] || '';
  const lowerBody = body.toLowerCase();

  if (serverHeader.toLowerCase().includes('nginx')) {
    techs.push({ name: 'Nginx', evidence: `Server header: ${serverHeader}`, confidence: 'High' });
  } else if (serverHeader.toLowerCase().includes('express') || poweredBy.toLowerCase().includes('express')) {
    techs.push({ name: 'Express.js', evidence: 'Detected via X-Powered-By', confidence: 'High' });
  }
  if (lowerBody.includes('react')) {
    techs.push({ name: 'React', evidence: 'Detected React marker', confidence: 'Medium' });
  }
  return techs;
}
