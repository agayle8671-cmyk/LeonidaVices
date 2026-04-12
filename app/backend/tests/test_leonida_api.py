"""Backend tests for Honest John's Travel Agency API"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestHealthAndRegions:
    """Health check and regions endpoints"""

    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "Leonida" in r.json().get("message", "")

    def test_get_regions_count(self):
        r = requests.get(f"{BASE_URL}/api/regions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6

    def test_regions_have_required_fields(self):
        r = requests.get(f"{BASE_URL}/api/regions")
        data = r.json()
        required = {"id", "name", "description", "satirical", "color"}
        for region in data:
            for field in required:
                assert field in region, f"Missing field {field} in region {region.get('name')}"

    def test_region_names(self):
        r = requests.get(f"{BASE_URL}/api/regions")
        names = {reg["name"] for reg in r.json()}
        expected = {"Vice City", "Grassrivers", "Ambrosia", "Port Gellhorn", "Mt. Kalaga NP", "Leonida Keys"}
        assert names == expected


class TestLocations:
    """Locations endpoint tests"""

    def test_get_locations_count(self):
        r = requests.get(f"{BASE_URL}/api/locations")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 10

    def test_locations_have_coords(self):
        r = requests.get(f"{BASE_URL}/api/locations")
        for loc in r.json():
            assert "name" in loc
            assert "x" in loc
            assert "y" in loc


class TestRoute:
    """Route planner A* endpoint tests"""

    def test_route_vice_to_kalaga(self):
        r = requests.post(f"{BASE_URL}/api/route", json={"start": "Vice City", "end": "Mt. Kalaga NP"})
        assert r.status_code == 200
        data = r.json()
        assert "path" in data
        assert data["path"][0] == "Vice City"
        assert data["path"][-1] == "Mt. Kalaga NP"
        assert data["total_distance"] > 0

    def test_route_has_waypoints(self):
        r = requests.post(f"{BASE_URL}/api/route", json={"start": "Vice City", "end": "Mt. Kalaga NP"})
        data = r.json()
        assert "waypoints" in data
        assert len(data["waypoints"]) >= 2

    def test_route_same_start_end(self):
        r = requests.post(f"{BASE_URL}/api/route", json={"start": "Vice City", "end": "Vice City"})
        assert r.status_code == 400

    def test_route_invalid_location(self):
        r = requests.post(f"{BASE_URL}/api/route", json={"start": "InvalidCity", "end": "Vice City"})
        assert r.status_code == 404

    def test_route_steps(self):
        r = requests.post(f"{BASE_URL}/api/route", json={"start": "Leonida Keys", "end": "Port Gellhorn"})
        assert r.status_code == 200
        data = r.json()
        assert "steps" in data
        assert len(data["steps"]) > 0


class TestChat:
    """Chat endpoint tests"""

    def test_chat_basic_response(self):
        r = requests.post(f"{BASE_URL}/api/chat", json={"message": "Tell me about Vice City"})
        assert r.status_code == 200
        data = r.json()
        assert "response" in data
        assert len(data["response"]) > 0
        assert "session_id" in data

    def test_chat_in_character(self):
        r = requests.post(f"{BASE_URL}/api/chat", json={"message": "What is Grassrivers?"})
        assert r.status_code == 200
        data = r.json()
        # Response should be non-empty
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 10
