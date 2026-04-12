"""
Backend tests for Auth, Community POIs, Admin, Leaderboard features
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_USER = "honest_john"
ADMIN_PASS = "leonida2026"
TEST_USER = f"test_cartographer_{int(time.time())}"
TEST_PASS = "test123"

class TestAuth:
    """Auth routes: register, login, me"""
    
    def test_register_new_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": TEST_USER, "password": TEST_PASS})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["username"] == TEST_USER.lower()
        assert "password_hash" not in data["user"]
        print(f"PASS: register returned token and user, id={data['user']['id']}")

    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"
        print(f"PASS: admin login, role={data['user']['role']}")

    def test_login_invalid_credentials(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "nobody", "password": "wrong"})
        assert r.status_code == 401
        print("PASS: invalid login returns 401")

    def test_auth_me_with_token(self):
        # Register fresh
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": f"{TEST_USER}_me", "password": TEST_PASS})
        token = r.json()["token"]
        r2 = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        data = r2.json()
        assert "password_hash" not in data
        assert "username" in data
        print("PASS: /auth/me returns user without password_hash")

    def test_auth_me_no_token(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401
        print("PASS: /auth/me without token returns 401")

    def test_register_duplicate_user(self):
        username = f"dup_{int(time.time())}"
        requests.post(f"{BASE_URL}/api/auth/register", json={"username": username, "password": "pass123"})
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": username, "password": "pass123"})
        assert r.status_code == 400
        print("PASS: duplicate register returns 400")

    def test_register_short_username(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": "ab", "password": "pass123"})
        assert r.status_code == 400
        print("PASS: short username returns 400")


class TestCommunityPOIs:
    """Community POI create, upvote, flag"""

    @pytest.fixture(autouse=True)
    def setup(self):
        # Register user and get token
        u = f"poi_tester_{int(time.time()*1000) % 999999}"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": u, "password": "test123"})
        data = r.json()
        self.token = data["token"]
        self.user_id = data["user"]["id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_create_poi_with_auth(self):
        r = requests.post(f"{BASE_URL}/api/community/pois", headers=self.headers, json={
            "name": "TEST_Pin", "description": "A test pin", "category": "landmark",
            "region": "Vice City", "x": 640, "y": 480
        })
        assert r.status_code == 200
        data = r.json()
        assert data["submitter_user_id"] == self.user_id
        assert data["name"] == "TEST_Pin"
        self.poi_id = data["id"]
        print("PASS: create POI with auth, submitter_user_id set correctly")

    def test_create_poi_anonymous(self):
        r = requests.post(f"{BASE_URL}/api/community/pois", json={
            "name": "TEST_Anon_Pin", "description": "Anon pin", "x": 640, "y": 480
        })
        assert r.status_code == 200
        data = r.json()
        assert data["submitter_user_id"] is None
        print("PASS: anonymous POI creation works")

    def test_upvote_poi(self):
        # Create a POI first
        r = requests.post(f"{BASE_URL}/api/community/pois", headers=self.headers, json={
            "name": "TEST_Upvote_Pin", "x": 640, "y": 480
        })
        poi_id = r.json()["id"]
        # Upvote it with another user
        u2 = f"upvoter_{int(time.time())}"
        r2 = requests.post(f"{BASE_URL}/api/auth/register", json={"username": u2, "password": "test123"})
        token2 = r2.json()["token"]
        r3 = requests.post(f"{BASE_URL}/api/community/pois/{poi_id}/upvote",
                           headers={"Authorization": f"Bearer {token2}"})
        assert r3.status_code == 200
        data = r3.json()
        assert data["upvoted"]
        assert data["count"] == 1
        print("PASS: upvote works, count=1")

    def test_upvote_toggle(self):
        # Create POI
        r = requests.post(f"{BASE_URL}/api/community/pois", headers=self.headers, json={
            "name": "TEST_Toggle_Pin", "x": 640, "y": 480
        })
        poi_id = r.json()["id"]
        # Upvote
        r2 = requests.post(f"{BASE_URL}/api/community/pois/{poi_id}/upvote", headers=self.headers)
        assert r2.json()["upvoted"]
        # Toggle off
        r3 = requests.post(f"{BASE_URL}/api/community/pois/{poi_id}/upvote", headers=self.headers)
        assert not r3.json()["upvoted"]
        print("PASS: upvote toggle works")

    def test_flag_poi_auto_hide(self):
        # Create a pin
        r = requests.post(f"{BASE_URL}/api/community/pois", json={"name": "TEST_Flag_Pin", "x": 640, "y": 480})
        poi_id = r.json()["id"]
        # Flag with 2 users → should auto-hide
        users = []
        for i in range(2):
            u = f"flagger_{int(time.time())}_{i}"
            rr = requests.post(f"{BASE_URL}/api/auth/register", json={"username": u, "password": "test123"})
            users.append(rr.json()["token"])
            time.sleep(0.1)
        r1 = requests.post(f"{BASE_URL}/api/community/pois/{poi_id}/flag",
                           headers={"Authorization": f"Bearer {users[0]}"}, json={"reason": "test"})
        assert r1.status_code == 200
        r2 = requests.post(f"{BASE_URL}/api/community/pois/{poi_id}/flag",
                           headers={"Authorization": f"Bearer {users[1]}"}, json={"reason": "test"})
        assert r2.status_code == 200
        assert r2.json()["flag_count"] == 2
        print("PASS: 2 flags auto-hides pin")


class TestAdminRoutes:
    """Admin POI management"""

    @pytest.fixture(autouse=True)
    def setup(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        self.admin_token = r.json()["token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

    def test_admin_get_pois(self):
        r = requests.get(f"{BASE_URL}/api/admin/pois", headers=self.admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        print(f"PASS: admin GET /admin/pois returns list with {len(r.json())} items")

    def test_admin_get_pois_non_admin(self):
        u = f"regular_{int(time.time())}"
        rr = requests.post(f"{BASE_URL}/api/auth/register", json={"username": u, "password": "test123"})
        token = rr.json()["token"]
        r = requests.get(f"{BASE_URL}/api/admin/pois", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 403
        print("PASS: non-admin cannot access /admin/pois")

    def test_admin_approve_poi(self):
        # Create a POI and flag it to hide
        r_poi = requests.post(f"{BASE_URL}/api/community/pois", json={"name": "TEST_Admin_Approve", "x": 640, "y": 480})
        poi_id = r_poi.json()["id"]
        # Approve it via admin
        r = requests.put(f"{BASE_URL}/api/admin/pois/{poi_id}/approve", headers=self.admin_headers)
        assert r.status_code == 200
        assert r.json()["approved"] == poi_id
        print("PASS: admin approve works")

    def test_admin_delete_poi(self):
        r_poi = requests.post(f"{BASE_URL}/api/community/pois", json={"name": "TEST_Admin_Delete", "x": 640, "y": 480})
        poi_id = r_poi.json()["id"]
        r = requests.delete(f"{BASE_URL}/api/admin/pois/{poi_id}/admin", headers=self.admin_headers)
        assert r.status_code == 200
        assert r.json()["deleted"] == poi_id
        print("PASS: admin delete works")


class TestLeaderboard:
    """Leaderboard and user stats"""

    def test_get_leaderboard(self):
        r = requests.get(f"{BASE_URL}/api/leaderboard")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        if data:
            entry = data[0]
            assert "rank" in entry
            assert "badge" in entry
            assert "score" in entry
        print(f"PASS: leaderboard returns {len(data)} entries")

    def test_user_stats(self):
        # Create a user and a POI, then check stats
        u = f"stats_user_{int(time.time())}"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={"username": u, "password": "test123"})
        data = r.json()
        user_id = data["user"]["id"]
        token = data["token"]
        # Create a POI
        requests.post(f"{BASE_URL}/api/community/pois", headers={"Authorization": f"Bearer {token}"},
                      json={"name": "TEST_Stats_Pin", "x": 640, "y": 480})
        # Check stats
        r2 = requests.get(f"{BASE_URL}/api/users/{user_id}/stats")
        assert r2.status_code == 200
        stats = r2.json()
        assert stats["pois_submitted"] == 1
        assert "badge" in stats
        assert "score" in stats
        print(f"PASS: user stats returns pois_submitted={stats['pois_submitted']}, badge={stats['badge']['name']}")
