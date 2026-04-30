# 🛠️ Tech-Stack

---

## Vollständige Technologie-Liste

### 📱 Mobile App
| Technologie | Version | Zweck |
|-------------|---------|-------|
| React Native + Expo | 0.74+ | iOS + Android aus einer Codebase |
| TypeScript | 5.x | Typsicherheit |
| Redux Toolkit | 2.x | State Management |
| Victory Native XL | Latest | Performance-Charts |
| React Navigation | 6.x | Navigation |
| Axios | 1.x | HTTP-Client |
| MMKV | Latest | Schneller lokaler Speicher (Offline-Cache) |

### 🐍 Backend
| Technologie | Version | Zweck |
|-------------|---------|-------|
| Python FastAPI | 0.110+ | Async REST API |
| SQLAlchemy | 2.x | ORM |
| Alembic | Latest | DB-Migrations |
| Pydantic v2 | 2.x | Datenvalidierung |
| asyncpg | Latest | Async PostgreSQL |
| httpx | Latest | Async HTTP-Requests |

### 🤖 Machine Learning
| Technologie | Version | Zweck |
|-------------|---------|-------|
| XGBoost | Latest | Haupt-Klassifikator |
| Scikit-learn | Latest | Preprocessing, Random Forest |
| NumPy + SciPy | Latest | Monte Carlo Simulation |
| SHAP | Latest | Modell-Erklärbarkeit |
| HuggingFace Transformers | 4.x | BERT NLP-Modul |
| Pandas | 2.x | Daten-Manipulation |

### 🗄️ Daten & Infrastruktur
| Technologie | Version | Zweck |
|-------------|---------|-------|
| PostgreSQL | 16 | Hauptdatenbank |
| TimescaleDB | Latest | Zeitreihendaten (xG-Historik) |
| Redis | 7 | Cache + Session Store |
| Celery | 5.x | Async Tasks + Scheduling |
| Apache Airflow | 2.x | ETL-Pipeline (optional, Celery reicht) |

### 🌐 Web & DevOps
| Technologie | Version | Zweck |
|-------------|---------|-------|
| Next.js | 14+ | Web-Dashboard (Phase 2) |
| Docker + Compose | Latest | Containerisierung |
| Railway / Render | - | Hosting + Auto-Deploy |
| Cloudflare R2 | - | CDN für Logos & Assets |
| Sentry | Latest | Error-Tracking |
| GitHub Actions | - | CI/CD |

---

## Installationsreihenfolge

```bash
# Backend
pip install fastapi uvicorn sqlalchemy asyncpg alembic pydantic
pip install xgboost scikit-learn numpy scipy shap pandas
pip install httpx celery redis transformers

# Mobile
npm install react-native expo
npm install @reduxjs/toolkit react-redux
npm install victory-native react-navigation axios
```

---

*→ [System](SYSTEM.md) · [Datenbank](DATABASE.md)*
