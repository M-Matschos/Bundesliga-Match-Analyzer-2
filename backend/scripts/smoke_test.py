"""
Staging Smoke Tests — Bundesliga Match Analyzer
Run against a live environment to verify all 9 core flows.

Usage:
    python scripts/smoke_test.py --base-url http://localhost:8000
    python scripts/smoke_test.py --base-url https://staging.matchoracle.app
"""

import argparse
import sys
import json
import time
from datetime import datetime

try:
    import httpx
except ImportError:
    print("ERROR: httpx not installed. Run: pip install httpx")
    sys.exit(1)


PASS = "✓"
FAIL = "✗"
SKIP = "○"


class SmokeTestRunner:
    def __init__(self, base_url: str, timeout: int = 10):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.Client(timeout=timeout)
        self.results = []
        self.access_token = None
        self.refresh_token = None
        self.test_email = f"smoke_{int(time.time())}@test.local"
        self.test_password = "SmokeTe$t123"

    def _check(self, name: str, response: httpx.Response, expected_status: int = 200) -> bool:
        ok = response.status_code == expected_status
        status = PASS if ok else FAIL
        self.results.append((status, name, response.status_code))
        print(f"  {status} [{response.status_code}] {name}")
        if not ok:
            print(f"      Response: {response.text[:200]}")
        return ok

    def run(self):
        print(f"\n{'='*60}")
        print(f"Smoke Tests — {self.base_url}")
        print(f"Started: {datetime.utcnow().isoformat()}Z")
        print(f"{'='*60}\n")

        self._flow_1_app_start()
        self._flow_2_register()
        self._flow_3_login()
        self._flow_4_token_refresh()
        self._flow_5_match_list()
        self._flow_6_prediction()
        self._flow_7_weekend_calculator()
        self._flow_8_notification_history()
        self._flow_9_logout()

        self._print_summary()

    # ── Flow 1: App Start / Health ──────────────────────────────────────────

    def _flow_1_app_start(self):
        print("Flow 1: App Start / Health")
        r = self.client.get(f"{self.base_url}/health")
        self._check("GET /health → 200 ok", r)
        r = self.client.get(f"{self.base_url}/health/detailed")
        ok = self._check("GET /health/detailed → 200", r)
        if ok:
            data = r.json()
            db_ok = data.get("checks", {}).get("database", {}).get("status") == "ok"
            status = PASS if db_ok else FAIL
            self.results.append((status, "DB connectivity", "-"))
            print(f"  {status} DB connectivity: {data.get('checks', {}).get('database', {})}")
        print()

    # ── Flow 2: Register ────────────────────────────────────────────────────

    def _flow_2_register(self):
        print("Flow 2: Register")
        r = self.client.post(
            f"{self.base_url}/api/v1/auth/register",
            json={"email": self.test_email, "password": self.test_password},
        )
        self._check("POST /auth/register → 201", r, expected_status=201)
        print()

    # ── Flow 3: Login ───────────────────────────────────────────────────────

    def _flow_3_login(self):
        print("Flow 3: Login")
        r = self.client.post(
            f"{self.base_url}/api/v1/auth/login",
            json={"email": self.test_email, "password": self.test_password},
        )
        ok = self._check("POST /auth/login → 200", r)
        if ok:
            data = r.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            has_tokens = bool(self.access_token and self.refresh_token)
            status = PASS if has_tokens else FAIL
            self.results.append((status, "Tokens present in response", "-"))
            print(f"  {status} Tokens present: access={bool(self.access_token)}, refresh={bool(self.refresh_token)}")
        print()

    # ── Flow 4: Token Refresh ───────────────────────────────────────────────

    def _flow_4_token_refresh(self):
        print("Flow 4: Token Refresh")
        if not self.refresh_token:
            print(f"  {SKIP} Skipped (no refresh token from login)")
            self.results.append((SKIP, "POST /auth/refresh", "-"))
            print()
            return
        r = self.client.post(
            f"{self.base_url}/api/v1/auth/refresh",
            json={"refresh_token": self.refresh_token},
        )
        ok = self._check("POST /auth/refresh → 200", r)
        if ok:
            self.access_token = r.json().get("access_token", self.access_token)
        print()

    def _auth_headers(self) -> dict:
        return {"Authorization": f"Bearer {self.access_token}"} if self.access_token else {}

    # ── Flow 5: Match List ──────────────────────────────────────────────────

    def _flow_5_match_list(self):
        print("Flow 5: Match List")
        r = self.client.get(
            f"{self.base_url}/api/v1/matches",
            params={"limit": 5},
            headers=self._auth_headers(),
        )
        ok = self._check("GET /matches?limit=5 → 200", r)
        if ok:
            data = r.json()
            has_matches_key = "matches" in data
            status = PASS if has_matches_key else FAIL
            self.results.append((status, "Response has 'matches' key", "-"))
            print(f"  {status} Response shape: total={data.get('total')}, matches count={len(data.get('matches', []))}")
            if data.get("matches"):
                first = data["matches"][0]
                has_teams = isinstance(first.get("home_team"), dict)
                status2 = PASS if has_teams else FAIL
                self.results.append((status2, "Match has enriched team objects", "-"))
                print(f"  {status2} Team enrichment: home_team={first.get('home_team', {}).get('name', 'MISSING')}")
        print()

    # ── Flow 6: Prediction ──────────────────────────────────────────────────

    def _flow_6_prediction(self):
        print("Flow 6: Prediction")
        # First get a match ID
        r = self.client.get(
            f"{self.base_url}/api/v1/matches",
            params={"limit": 1},
            headers=self._auth_headers(),
        )
        if r.status_code != 200 or not r.json().get("matches"):
            print(f"  {SKIP} Skipped (no matches available)")
            self.results.append((SKIP, "GET /predictions/{match_id}", "-"))
            print()
            return

        match_id = r.json()["matches"][0].get("id") or r.json()["matches"][0].get("match_id")
        r2 = self.client.get(
            f"{self.base_url}/api/v1/predictions/{match_id}",
            headers=self._auth_headers(),
        )
        ok = self._check(f"GET /predictions/{{match_id}} → 200", r2)
        if ok:
            data = r2.json()
            has_aliases = "home_win" in data and "confidence_label" in data
            status = PASS if has_aliases else FAIL
            self.results.append((status, "Prediction has mobile field aliases", "-"))
            print(f"  {status} Field aliases: home_win={data.get('home_win')}, confidence_label={data.get('confidence_label')}")
        print()

    # ── Flow 7: Weekend Calculator ──────────────────────────────────────────

    def _flow_7_weekend_calculator(self):
        print("Flow 7: Weekend Calculator")
        r = self.client.get(
            f"{self.base_url}/api/v1/weekend/next",
            params={"leagues": "bundesliga"},
            headers=self._auth_headers(),
        )
        self._check("GET /weekend/next → 200", r)
        print()

    # ── Flow 8: Notification History ────────────────────────────────────────

    def _flow_8_notification_history(self):
        print("Flow 8: Notification History")
        r = self.client.get(
            f"{self.base_url}/api/v1/notifications/history/1",
            headers=self._auth_headers(),
        )
        # 200 (empty list) or 404 both acceptable — proves endpoint reachable
        reached = r.status_code in (200, 404)
        status = PASS if reached else FAIL
        self.results.append((status, "GET /notifications/history/1 reachable", "-"))
        print(f"  {status} [{r.status_code}] GET /notifications/history/1 reachable")
        print()

    # ── Flow 9: Logout ──────────────────────────────────────────────────────

    def _flow_9_logout(self):
        print("Flow 9: Logout")
        if not self.access_token:
            print(f"  {SKIP} Skipped (not logged in)")
            self.results.append((SKIP, "POST /auth/logout", "-"))
            print()
            return
        r = self.client.post(
            f"{self.base_url}/api/v1/auth/logout",
            headers=self._auth_headers(),
        )
        self._check("POST /auth/logout → 200", r)
        print()

    # ── Summary ─────────────────────────────────────────────────────────────

    def _print_summary(self):
        passed = sum(1 for s, _, _ in self.results if s == PASS)
        failed = sum(1 for s, _, _ in self.results if s == FAIL)
        skipped = sum(1 for s, _, _ in self.results if s == SKIP)
        total = len(self.results)

        print(f"{'='*60}")
        print(f"Results: {passed}/{total} passed  |  {failed} failed  |  {skipped} skipped")
        print(f"{'='*60}")

        if failed > 0:
            print("\nFailed checks:")
            for status, name, code in self.results:
                if status == FAIL:
                    print(f"  {FAIL} {name} (got {code})")

        exit_code = 0 if failed == 0 else 1
        print(f"\nExit code: {exit_code}")
        sys.exit(exit_code)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Staging smoke tests")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Backend base URL")
    parser.add_argument("--timeout", type=int, default=10, help="Request timeout in seconds")
    args = parser.parse_args()

    runner = SmokeTestRunner(base_url=args.base_url, timeout=args.timeout)
    runner.run()
