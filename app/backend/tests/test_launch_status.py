import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Admin credentials
ADMIN_USER = "honest_john"
ADMIN_PASS = "leonida2026"

@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]

@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

class TestLaunchStatus:
    """Launch status API tests"""
    
    def test_get_launch_status_public(self):
        r = requests.get(f"{BASE_URL}/api/system/launch-status")
        assert r.status_code == 200
        data = r.json()
        assert "launched" in data
        assert "auto_launched" in data
        assert "manual_override" in data
        print(f"Launch status: {data}")

    def test_get_launch_status_fields(self):
        r = requests.get(f"{BASE_URL}/api/system/launch-status")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data["launched"], bool)
        assert isinstance(data["auto_launched"], bool)
        assert isinstance(data["manual_override"], bool)
        assert "launch_date" in data
        print(f"Fields validated: {data}")

    def test_put_launch_status_requires_auth(self):
        r = requests.put(f"{BASE_URL}/api/system/launch-status", json={"launched": True})
        assert r.status_code in [401, 403], f"Expected auth error, got {r.status_code}"
        print(f"Unauthenticated PUT correctly blocked: {r.status_code}")

    def test_put_launch_status_as_admin_enable(self, admin_headers):
        r = requests.put(f"{BASE_URL}/api/system/launch-status", json={"launched": True}, headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["manual_override"]
        print(f"Admin enabled launch: {data}")

    def test_get_launch_status_after_enable(self):
        r = requests.get(f"{BASE_URL}/api/system/launch-status")
        assert r.status_code == 200
        data = r.json()
        assert data["manual_override"]
        assert data["launched"]
        print(f"Status after enable: {data}")

    def test_put_launch_status_as_admin_disable(self, admin_headers):
        r = requests.put(f"{BASE_URL}/api/system/launch-status", json={"launched": False}, headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert not data["manual_override"]
        print(f"Admin disabled launch: {data}")

    def test_get_launch_status_after_disable(self):
        r = requests.get(f"{BASE_URL}/api/system/launch-status")
        assert r.status_code == 200
        data = r.json()
        assert not data["manual_override"]
        print(f"Status after disable: {data}")
