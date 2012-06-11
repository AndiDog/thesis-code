import httplib2
import json
from urllib import urlencode

with open("config.json") as f:
    baseUri = str(json.load(f)["baseUri"])
    assert baseUri.endswith("/")

client = httplib2.Http()
response, content = client.request(baseUri + "orders/", method = "OPTIONS")
assert response.status == 204 and not content