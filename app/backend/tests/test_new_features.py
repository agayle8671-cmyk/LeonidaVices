"""Tests for new features: News scraper, Community POIs"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewsEndpoints:
    """News scraper endpoint tests"""

    def test_get_news_returns_list(self):
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/news: {len(data)} articles")

    def test_get_news_article_structure(self):
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            article = data[0]
            assert "id" in article
            assert "title" in article
            assert "source" in article
            assert "url" in article
            assert "scraped_at" in article
            print(f"Article structure OK: {article['title'][:50]}")
        else:
            print("No articles found - may need a refresh")

    def test_get_news_with_limit(self):
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
        print(f"GET /api/news?limit=5: {len(data)} articles")

    def test_news_status(self):
        response = requests.get(f"{BASE_URL}/api/news/status")
        assert response.status_code == 200
        data = response.json()
        assert "total_articles" in data
        assert "last_scrape" in data
        assert isinstance(data["total_articles"], int)
        print(f"News status: {data['total_articles']} total articles, last: {data['last_scrape']}")

    def test_news_refresh(self):
        response = requests.post(f"{BASE_URL}/api/news/refresh", timeout=60)
        assert response.status_code == 200
        data = response.json()
        assert "scraped" in data
        assert "message" in data
        assert isinstance(data["scraped"], int)
        print(f"News refresh: {data['scraped']} new articles")


class TestCommunityPOIs:
    """Community POI CRUD tests"""

    def test_get_pois_returns_list(self):
        response = requests.get(f"{BASE_URL}/api/community/pois")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/community/pois: {len(data)} pins")

    def test_create_poi(self):
        payload = {
            "name": "TEST_Secret Location Alpha",
            "description": "A test community pin for automated testing",
            "category": "landmark",
            "region": "vice-city",
            "x": 640.0,
            "y": 480.0,
            "submitter_name": "TestBot"
        }
        response = requests.post(f"{BASE_URL}/api/community/pois", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["category"] == "landmark"
        assert data["approved"]
        assert "submitted_at" in data
        print(f"Created POI: {data['id']}")
        return data["id"]

    def test_create_and_get_poi_persisted(self):
        payload = {
            "name": "TEST_Persistence Check",
            "description": "Testing persistence",
            "category": "scenic",
            "region": "grassrivers",
            "x": 345.0,
            "y": 470.0,
            "submitter_name": "Tester"
        }
        create_res = requests.post(f"{BASE_URL}/api/community/pois", json=payload)
        assert create_res.status_code == 200
        created = create_res.json()
        poi_id = created["id"]

        # GET all and check it's there
        get_res = requests.get(f"{BASE_URL}/api/community/pois")
        assert get_res.status_code == 200
        pois = get_res.json()
        found = next((p for p in pois if p["id"] == poi_id), None)
        assert found is not None
        assert found["name"] == payload["name"]
        print(f"POI persistence verified: {poi_id}")

        # Cleanup
        requests.delete(f"{BASE_URL}/api/community/pois/{poi_id}")

    def test_delete_poi(self):
        # Create first
        payload = {
            "name": "TEST_Delete Me",
            "description": "",
            "category": "other",
            "region": "ambrosia",
            "x": 338.0,
            "y": 328.0,
            "submitter_name": ""
        }
        create_res = requests.post(f"{BASE_URL}/api/community/pois", json=payload)
        poi_id = create_res.json()["id"]

        # Delete
        delete_res = requests.delete(f"{BASE_URL}/api/community/pois/{poi_id}")
        assert delete_res.status_code == 200
        data = delete_res.json()
        assert data["deleted"] == poi_id
        print(f"Deleted POI: {poi_id}")

        # Verify gone
        get_res = requests.get(f"{BASE_URL}/api/community/pois")
        pois = get_res.json()
        found = next((p for p in pois if p["id"] == poi_id), None)
        assert found is None
        print("Delete verified: POI not found after deletion")

    def test_delete_nonexistent_poi_returns_404(self):
        response = requests.delete(f"{BASE_URL}/api/community/pois/nonexistent-id-xyz")
        assert response.status_code == 404
        print("404 on nonexistent POI delete: OK")

    def test_create_poi_minimal(self):
        """Test with only required fields"""
        payload = {
            "name": "TEST_Minimal Pin",
            "x": 400.0,
            "y": 300.0
        }
        response = requests.post(f"{BASE_URL}/api/community/pois", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Minimal Pin"
        assert data["category"] == "landmark"  # default
        # Cleanup
        requests.delete(f"{BASE_URL}/api/community/pois/{data['id']}")
        print("Minimal POI creation: OK")


class TestExistingEndpoints:
    """Quick regression on existing endpoints"""

    def test_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200

    def test_regions(self):
        response = requests.get(f"{BASE_URL}/api/regions")
        assert response.status_code == 200
        assert len(response.json()) == 6

    def test_locations(self):
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 200
        assert len(response.json()) == 10
