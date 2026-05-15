# Phase 4: Action Items 1–4 (RC-Reife Finalisierung)

**Status:** Plan erstellt | **Startdatum:** 2026-05-14  
**Ziel:** 490+ passing tests + RC-ready-Deklaration  
**Zeitbudget:** ~2,5 Stunden (Item 1 + 2 + 3 + 4)

---

## Action Item 1: Fix MD5 Hashing Vulnerability (HIGH — 30 min)

### Problem
MD5-Hashing ohne `usedforsecurity=False` wirft DeprecationWarning in Python 3.9+. Security-Kontext:
- MD5 ist für Hashing nicht als sicher angesehen
- Wenn MD5 nur für nicht-sicherheitskritische Zwecke genutzt wird (z.B. Checksummen), muss das explizit signalisiert werden

### Ausführungsschritte

1. **Grep für MD5-Nutzung:**
   ```bash
   grep -r "md5()" backend/app/ --include="*.py"
   ```
   Erwartet: ~2 Vorkommen

2. **Jedes Vorkommen prüfen:**
   - Kontext lesen: Wird MD5 für Sicherheit oder nur Checksumme genutzt?
   - Wenn Checksumme/nicht-sicherheitskritisch: `usedforsecurity=False` hinzufügen
   - Falls Sicherheit nötig: Zu SHA-256 migrieren

3. **Beispiel-Fix:**
   ```python
   # BEFORE
   hash_value = hashlib.md5(data).hexdigest()
   
   # AFTER (falls nicht-sicherheitskritisch)
   hash_value = hashlib.md5(data, usedforsecurity=False).hexdigest()
   ```

4. **Test-Verify:**
   ```bash
   cd backend && python -W error::DeprecationWarning -c "import app.main"
   ```
   (Sollte keine DeprecationWarning werfen)

### Erfolg-Kriterium
- ✅ Keine MD5-Deprecation-Warnings mehr
- ✅ Tests laufen ohne `-W ignore` Flag

### Commit-Format
```
fix: Add usedforsecurity=False to MD5 hashing for non-security contexts
```

---

## Action Item 2: Document 3 Pre-Existing Bugs in RC Release Notes (MEDIUM — 15 min)

### Problem
Drei bekannte Bugs sind nicht Security-Critical, aber sollten in Release Notes dokumentiert sein:
1. **Token Refresh Bug:** Refresh-Endpoint gibt denselben Token zurück statt neuen
2. **Admin Auth Bug:** GET /api/v1/users mit admin-user-token gibt 401 statt 200
3. **Bcrypt Rounds Config:** `bcrypt_rounds` Setting fehlt, wird hardcoded verwendet

### Ausführungsschritte

1. **Erstelle `CHANGELOG_RC.md`:**
   ```bash
   touch backend/CHANGELOG_RC.md
   ```

2. **Fülle mit Struktur:**
   ```markdown
   # Release Candidate 1.0.0-rc.1
   **Date:** 2026-05-14  
   **Test Status:** 486 passing, 10 failing (pre-existing)
   
   ## Known Issues (Post-RC Roadmap)
   
   ### Issue 1: Token Refresh Returns Same Token
   - **Severity:** MEDIUM
   - **Affected:** POST /api/v1/auth/refresh
   - **Symptom:** Token doesn't refresh on call
   - **Workaround:** Request new login
   - **Fix Timeline:** Post-RC
   
   ### Issue 2: Admin User Endpoint Returns 401
   - **Severity:** MEDIUM
   - **Affected:** GET /api/v1/users (with admin token)
   - **Symptom:** Authorization check may be too strict
   - **Workaround:** Use root user account
   - **Fix Timeline:** Post-RC
   
   ### Issue 3: Bcrypt Rounds Hardcoded
   - **Severity:** LOW
   - **Affected:** Password hashing configuration
   - **Symptom:** `bcrypt_rounds` not configurable via settings
   - **Workaround:** Rebuild with different value in code
   - **Fix Timeline:** Post-RC
   
   ## What's New (Phase 4 Complete ✅)
   - WebSocket integration with Redis Pub/Sub
   - FCM notification system
   - Virtual betting system with auto-resolution
   - Rate-limiting on auth endpoints
   
   ## Verification Command
   \`\`\`bash
   cd backend && pytest --tb=short -q 2>&1 | tail -3
   # Expected: 486 passed, 10 failed
   \`\`\`
   ```

3. **Commit-Datei:**
   ```bash
   git add backend/CHANGELOG_RC.md
   git commit -m "docs: Add RC release notes with known issues"
   ```

### Erfolg-Kriterium
- ✅ `CHANGELOG_RC.md` existiert mit allen 3 Bugs dokumentiert
- ✅ Workarounds für jeden Bug beschrieben
- ✅ Post-RC Roadmap klar

---

## Action Item 3: Fix 4 Route Path Tests (MEDIUM — 20 min)

### Problem
4 Tests erwarten falsche API-Paths. Sie scheitern mit AssertionError bei Path-Vergleich:
- `test_get_profile` — erwartet `/api/v1/auth/me`, tatsächlich ist es `/api/v1/auth/profile`
- `test_get_player_detail` — erwartet `/api/v1/players/{id}`, ist aber `/api/v1/teams/{team_id}/players/{id}`
- `test_get_player_stats` — ähnliche Path-Diskrepanz
- `test_list_user_bets` — erwartet `/api/v1/bets`, ist aber `/api/v1/virtual-bets`

### Ausführungsschritte

1. **Lese alle 4 Test-Assertions:**
   ```bash
   grep -n "assert.*path\|assert.*url" backend/tests/integration/test_complete_api_flow.py | head -20
   ```

2. **Für jeden Test: Aktuelle Assertion gegen aktuelles Route-Schema überprüfen**
   - Open `backend/tests/integration/test_complete_api_flow.py`
   - Find Test A, B, C, D (line numbers aus earlier session's failure list)
   - Check gegen `backend/app/routers/*.py` für tatsächliche Paths

3. **Fix pattern (Beispiel):**
   ```python
   # BEFORE
   assert response.json()["data"]["path"] == "/api/v1/players/{id}"
   
   # AFTER (falls tatsächlicher Path anders ist)
   assert response.json()["data"]["path"] == "/api/v1/teams/{team_id}/players/{id}"
   ```

4. **Teste nach jeder Änderung:**
   ```bash
   cd backend && pytest tests/integration/test_complete_api_flow.py::TestPlayersRouter::test_get_player_detail -v
   ```

### Erfolg-Kriterium
- ✅ Alle 4 Tests laufen ohne AssertionError
- ✅ `pytest tests/integration/test_complete_api_flow.py -q` zeigt 0 failures (in dieser Datei)
- ✅ 486 → 490 passing tests (4 neue)

### Commit-Format
```
fix: Correct 4 API path assertions in test_complete_api_flow.py
```

---

## Action Item 4: Update 4 Runtime Dependency Packages (HIGH — 1–2 hours)

### Problem
Vier Packages sind veraltet und sollten auf aktuelle Versionen aktualisiert werden:

| Package | Aktuell | Ziel | Risiko |
|---------|---------|------|--------|
| cryptography | 46.0.5 | 46.0.7 | NIEDRIG (Patch) |
| python-multipart | 0.0.22 | 0.0.27 | MEDIUM (Minor) |
| urllib3 | 2.6.3 | 2.7.0 | MEDIUM (Minor) |
| requests | 2.32.5 | 2.33.0 | LOW (Minor) |

### Ausführungsschritte

1. **Backup requirements.txt:**
   ```bash
   cp backend/requirements.txt backend/requirements.txt.backup
   ```

2. **Update einzelne Packages in `backend/requirements.txt`:**
   ```
   # Finde diese Zeilen und update:
   cryptography==46.0.5          → cryptography==46.0.7
   python-multipart==0.0.22      → python-multipart==0.0.27
   urllib3==2.6.3                → urllib3==2.7.0
   requests==2.32.5              → requests==2.33.0
   ```

3. **Installiere neue Versions lokal:**
   ```bash
   cd backend
   pip install --upgrade -r requirements.txt
   ```

4. **Starte full test suite (kritisch für dependency-Changes):**
   ```bash
   cd backend
   pytest --tb=short -q 2>&1 | tail -5
   ```
   
   **Erwartetes Ergebnis:**
   ```
   490 passed, 6 failed
   ```
   (oder ähnlich — sollte nicht mehr als vorher fehlschlagen)

5. **Falls Tests scheitern:** Revert zu backup und einzeln updaten
   ```bash
   cp backend/requirements.txt.backup backend/requirements.txt
   pip install -r requirements.txt
   ```

6. **Commit nach erfolgreichem Test:**
   ```bash
   git add backend/requirements.txt
   git commit -m "chore: Update 4 runtime dependencies (cryptography, python-multipart, urllib3, requests)"
   ```

### Erfolg-Kriterium
- ✅ Alle 4 Packages auf Ziel-Version aktualisiert
- ✅ `pip freeze | grep -E "cryptography|python-multipart|urllib3|requests"` zeigt neue Versions
- ✅ Full test suite läuft ohne neue Fehler (oder nur pre-existing 10)
- ✅ Commit gepusht

---

## Exekutions-Reihenfolge & Dependencies

```
Item 1 (MD5)           → Item 2 (Release Notes) → Item 3 (Path Tests) → Item 4 (Dependencies)
│                        │                         │                     │
30 min                   15 min                    20 min               1–2 hours
(unabhängig)           (unabhängig)              (unabhängig)         (kritisch zuletzt)

Total: ~2,5 Stunden
```

**Warum diese Reihenfolge?**
- Items 1–3 sind unabhängig, können parallel laufen
- Item 4 (Dependency-Update) sollte **zuletzt** kommen, weil:
  - Es das gesamte Test-Ergebnis verändern kann
  - Falls Breakage: einfacher zu Rollback
  - Baseline (486 passing) muss stabil sein vor Dependency-Changes

---

## Final Verification

Nach allen 4 Items:

```bash
cd backend && pytest --tb=short -q 2>&1 | tail -5
# Expected: 490+ passed, <6 failed
```

**RC-Ready-Checkliste:**
- [ ] Item 1: MD5 DeprecationWarning behoben
- [ ] Item 2: CHANGELOG_RC.md mit 3 Known Issues dokumentiert
- [ ] Item 3: 4 Path-Tests auf green
- [ ] Item 4: Dependencies aktualisiert + Test-Suite grün
- [ ] Commit-Status: 4 neue Commits (1 fix, 1 docs, 1 fix, 1 chore)
- [ ] Test-Baseline: 490+ passing
- [ ] Git Status: Clean, alle Änderungen commitet

---

## Sicherheits- und Qualitäts-Gates

Vor finalem Merge:

```bash
# 1. Security Check
/ecc:security-scan backend/ --strict

# 2. Quality Gate
/ecc:quality-gate backend/ --strict

# 3. Verification Loop
/ecc:verify
```

---

## Next Session (Nach Phase 4 Complete)

**Wenn alle 4 Items done:**
1. `git log --oneline -5` zeigt 4 neue Commits
2. `pytest --co -q backend/tests/ | wc -l` zeigt ~500+ Tests
3. RC-Ready-Verdict: **APPROVED** (unter Vorbehalt der 10 pre-existing failures)
4. Optionales Post-RC-Roadmap:
   - Item 5: Token Refresh Fix (Phase 5)
   - Item 6: Admin Auth Fix (Phase 5)
   - Item 7: Bcrypt Config Extraction (Phase 5)
   - Item 8: Desktop App Build Completion (separate initiative)
