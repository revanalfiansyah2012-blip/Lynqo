import fs from 'fs';
import path from 'path';
import { ScanResultData, SecurityReport } from '../types.js';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export interface AppDatabase {
  scans: Record<string, ScanResultData>;
  reports: Record<string, SecurityReport>;
}

export class LocalStorage {
  public static load(): AppDatabase {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load storage:', err);
    }
    return { scans: {}, reports: {} };
  }

  public static save(db: AppDatabase) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save storage:', err);
    }
  }
}
