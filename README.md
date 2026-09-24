# LynQo Vulnerability Suite - Part 5 (One-Command Runner & Installer)

Tool keamanan web profesional dengan workflow lengkap:
**DISCOVERY → SECURITY AUDIT → ANALYSIS → REPORTING → REMEDIATION → VERIFICATION**

## Quick Start

```bash
git clone <repository>
cd lynqo
chmod +x install.sh
./install.sh
lynqo
```

Lalu buka browser di **http://localhost:8080**

## CLI Commands

- `lynqo` - Menjalankan LynQo Vulnerability (Frontend + Backend + Health Check)
- `lynqo --help` - Menampilkan bantuan
- `lynqo --version` - Menampilkan versi
- `lynqo --port 8081` - Menjalankan pada port kustom
- `lynqo doctor` - Memeriksa kesiapan environment & dependensi
- `lynqo clean` - Membersihkan file runtime sementara (.venv, logs) tanpa merusak database scan
