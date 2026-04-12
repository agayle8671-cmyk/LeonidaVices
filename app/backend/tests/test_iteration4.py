"""Iteration 4 tests: modular server, email notifications, admin password update, leaderboard $nin."""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestModularServer:
    """Confirm modular server loads and root returns welcome message."""

    def test_root_returns_welcome(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "Honest John" in data["message"] or "Leonida" in data["message"]
        print(f"Root: {data['message']}")

    def test_regions_still_work(self):
        r = requests.get(f"{BASE_URL}/api/regions")
        assert r.status_code == 200
        regions = r.json()
        assert len(regions) >= 5
        print(f"Regions OK: {len(regions)} items")

    def test_leaderboard_no_duplicate_key_error(self):
        r = requests.get(f"{BASE_URL}/api/leaderboard")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"Leaderboard OK: {len(data)} entries (no $ne/$nin error)")

    def test_news_returns_articles(self):
        r = requests.get(f"{BASE_URL}/api/news")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"News articles: {len(data)}")


class TestAuthWithEmail:
    """Register with email, login, verify /me contains email."""

    TEST_USER = f"TEST_emailuser_{int(time.time() * 1000)}"
    TEST_PW = "testpass123"
    TEST_EMAIL = "test_leonida@example.com"
    token = None
    user_id = None

    def test_register_with_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "username": self.TEST_USER,
            "password": self.TEST_PW,
            "email": self.TEST_EMAIL,
        })
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == self.TEST_EMAIL
        TestAuthWithEmail.token = data["token"]
        TestAuthWithEmail.user_id = data["user"]["id"]
        print(f"Registered {self.TEST_USER} with email OK")

    def test_login_with_registered_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": self.TEST_USER,
            "password": self.TEST_PW,
        })
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == self.TEST_EMAIL
        print("Login returns email OK")

    def test_auth_me_returns_email(self):
        assert TestAuthWithEmail.token, "Need token from register test"
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         headers={"Authorization": f"Bearer {TestAuthWithEmail.token}"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == self.TEST_EMAIL
        print("GET /me returns email OK")

    def test_admin_login_returns_admin_role(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "honest_john",
            "password": "leonida2026",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["role"] == "admin"
        print("Admin login returns role=admin OK")


class TestUpvoteEmailFiredAndForgot:
    """Upvote triggers email fire-and-forget (non-blocking). Verify 3 upvotes → verified=True."""

    token1 = None
    token2 = None
    token3 = None
    token4 = None
    poi_id = None

    @classmethod
    def _register(cls, suffix):
        uname = f"TEST_uv_{suffix}_{int(time.time()*1000)}"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "username": uname, "password": "pass123456"
        })
        assert r.status_code == 200
        return r.json()["token"]

    def test_setup_users_and_poi(self):
        TestUpvoteEmailFiredAndForgot.token1 = self._register("creator")
        TestUpvoteEmailFiredAndForgot.token2 = self._register("voter1")
        TestUpvoteEmailFiredAndForgot.token3 = self._register("voter2")
        TestUpvoteEmailFiredAndForgot.token4 = self._register("voter3")
        # Create POI
        r = requests.post(f"{BASE_URL}/api/community/pois",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token1}"},
            json={"name": "TEST_EmailPOI", "description": "testing", "x": 100, "y": 100,
                  "category": "landmark", "region": "Vice City"})
        assert r.status_code == 200
        TestUpvoteEmailFiredAndForgot.poi_id = r.json()["id"]
        print(f"POI created: {TestUpvoteEmailFiredAndForgot.poi_id}")

    def test_upvote_1_non_blocking(self):
        t = time.time()
        r = requests.post(f"{BASE_URL}/api/community/pois/{self.poi_id}/upvote",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token2}"})
        elapsed = time.time() - t
        assert r.status_code == 200
        assert r.json()["count"] == 1
        assert elapsed < 5, f"Upvote took {elapsed:.2f}s — may be blocking"
        print(f"Upvote 1 OK, response time: {elapsed:.2f}s")

    def test_upvote_2_non_blocking(self):
        r = requests.post(f"{BASE_URL}/api/community/pois/{self.poi_id}/upvote",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token3}"})
        assert r.status_code == 200
        assert r.json()["count"] == 2
        print("Upvote 2 OK")

    def test_upvote_3_triggers_verified(self):
        r = requests.post(f"{BASE_URL}/api/community/pois/{self.poi_id}/upvote",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token4}"})
        assert r.status_code == 200
        data = r.json()
        assert data["count"] == 3
        print("Upvote 3 OK — verified should now be True")
        # Verify the POI is marked verified
        time.sleep(1)
        pois_r = requests.get(f"{BASE_URL}/api/community/pois",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token1}"})
        pois = pois_r.json()
        poi = next((p for p in pois if p["id"] == self.poi_id), None)
        assert poi is not None
        assert poi["verified"], f"Expected verified=True, got {poi.get('verified')}"
        print("POI verified=True confirmed")

    def test_cleanup_poi(self):
        r = requests.delete(f"{BASE_URL}/api/community/pois/{self.poi_id}",
            headers={"Authorization": f"Bearer {TestUpvoteEmailFiredAndForgot.token1}"})
        assert r.status_code == 200
        print("Test POI deleted")
