import httplib2
import json
from urllib import urlencode

with open("config.json") as f:
    baseUri = str(json.load(f)["baseUri"])
    assert baseUri.endswith("/")

client = httplib2.Http()
response, content = client.request(baseUri + "orders/")
assert response.status == 200 and response["content-type"] == "application/json", (response, content)
res = json.loads(content)

filteredOrders = [order for order in res["orders"] if order["submissionDate"] is None]
assert len(filteredOrders) <= 1

if not filteredOrders:
    print "No current order exists, cannot test submission"
    exit(1)

currentOrder = filteredOrders[0]

response, content = client.request(baseUri + "order/%d/submit/" % currentOrder["id"],
                                   "POST",
                                   body = urlencode({"username" : "user", "password" : "pass", "storeId" : 3}),
                                   headers = {"Content-Type": "application/x-www-form-urlencoded"})
assert response.status == 200 and response["content-type"] == "application/json", (response, content)
print json.loads(content)
