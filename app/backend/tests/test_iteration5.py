"""Iteration 5 tests: email prefs, me/pins, preferences update"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

ADMIN_USER = "honest_john"
ADMIN_PASS = "leonida2026"
TEST_USER = "test_iter5_user"
TEST_PASS = "testpass123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def test_user_token():
    # Try register first, then login
    requests.post(f"{BASE_URL}/api/auth/register", json={"username": TEST_USER, "password": TEST_PASS, "email": "testiter5@test.com"})
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": TEST_USER, "password": TEST_PASS})
    assert r.status_code == 200
    return r.json()["token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


class TestPreferences:
    """PUT /api/auth/me/preferences"""

    def test_update_display_name(self, test_user_token):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"display_name": "TEST_DisplayName"},
                         headers=auth_headers(test_user_token))
        assert r.status_code == 200
        data = r.json()
        assert data["display_name"] == "TEST_DisplayName"

    def test_update_email(self, test_user_token):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"email": "updated@example.com"},
                         headers=auth_headers(test_user_token))
        assert r.status_code == 200
        assert r.json()["email"] == "updated@example.com"

    def test_email_upvote_pref_false(self, test_user_token):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"email_upvote": False},
                         headers=auth_headers(test_user_token))
        assert r.status_code == 200
        data = r.json()
        assert not data.get("prefs", {}).get("email_upvote")

    def test_email_verified_pref_false(self, test_user_token):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"email_verified": False},
                         headers=auth_headers(test_user_token))
        assert r.status_code == 200
        data = r.json()
        assert not data.get("prefs", {}).get("email_verified")

    def test_email_pref_re_enable(self, test_user_token):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"email_upvote": True, "email_verified": True},
                         headers=auth_headers(test_user_token))
        assert r.status_code == 200
        data = r.json()
        assert data.get("prefs", {}).get("email_upvote")
        assert data.get("prefs", {}).get("email_verified")

    def test_prefs_persisted_in_me(self, test_user_token):
        # disable upvote
        requests.put(f"{BASE_URL}/api/auth/me/preferences",
                     json={"email_upvote": False},
                     headers=auth_headers(test_user_token))
        # verify via GET /api/auth/me
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers(test_user_token))
        assert r.status_code == 200
        assert not r.json().get("prefs", {}).get("email_upvote")

    def test_unauth_returns_401(self):
        r = requests.put(f"{BASE_URL}/api/auth/me/preferences",
                         json={"email_upvote": False})
        assert r.status_code == 401


class TestMyPins:
    """GET /api/users/me/pins"""

    def test_get_my_pins_authenticated(self, test_user_token):
        r = requests.get(f"{BASE_URL}/api/users/me/pins", headers=auth_headers(test_user_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_my_pins_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/users/me/pins")
        assert r.status_code == 401

    def test_my_pins_no_id_field(self, test_user_token):
        r = requests.get(f"{BASE_URL}/api/users/me/pins", headers=auth_headers(test_user_token))
        data = r.json()
        for pin in data:
            assert "_id" not in pin, "MongoDB _id should not be exposed"

    def test_my_pins_only_own(self, test_user_token):
        """Create a pin and verify it shows in /me/pins"""
        # Create a pin
        create_r = requests.post(f"{BASE_URL}/api/community/pois",
                                  json={"name": "TEST_MyPin", "description": "test", "category": "landmark",
                                        "region": "Vice City", "x": 640.0, "y": 480.0},
                                  headers=auth_headers(test_user_token))
        assert create_r.status_code == 200
        created = create_r.json()

        # Get my pins
        pins_r = requests.get(f"{BASE_URL}/api/users/me/pins", headers=auth_headers(test_user_token))
        assert pins_r.status_code == 200
        pin_ids = [p["id"] for p in pins_r.json()]
        assert created["id"] in pin_ids, "Newly created pin should be in /me/pins"

        # Cleanup
        requests.delete(f"{BASE_URL}/api/community/pois/{created['id']}", headers=auth_headers(test_user_token))
