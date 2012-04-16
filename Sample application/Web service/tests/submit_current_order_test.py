import httplib2
import json
from urllib import urlencode

client = httplib2.Http()
response, content = client.request("http://localhost:8087/orders/")
assert response.status == 200 and response["content-type"] == "application/json", (response, content)
res = json.loads(content)

filteredOrders = [order for order in res["orders"] if order["submissionDate"] is None]
assert len(filteredOrders) <= 1

if not filteredOrders:
    print "No current order exists, cannot test submission"
    exit(1)

currentOrder = filteredOrders[0]

response, content = client.request("http://localhost:8087/order/%d/submit/" % currentOrder["id"],
                                   "POST",
                                   body = urlencode({"username" : "user", "password" : "pass"}),
                                   headers = {"Content-Type": "application/x-www-form-urlencoded"})
assert response.status == 200 and response["content-type"] == "application/json", (response, content)
print json.loads(content)
