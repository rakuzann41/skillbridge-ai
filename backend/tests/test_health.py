import unittest

from fastapi.testclient import TestClient

from app.main import app


class HealthTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_contract(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "status": "ok", "service": "skillbridge-api", "version": "0.3.0"
        })

    def test_unimplemented_private_routes_are_not_exposed(self):
        for path in ("/skills",):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)

    def test_cors_does_not_allow_an_arbitrary_origin(self):
        response = self.client.get("/health", headers={"Origin": "https://untrusted.example"})
        self.assertNotIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
