import httplib2
import os
import random
import string
import sys
import json

with open("config.json") as f:
    baseUri = str(json.load(f)["baseUri"])
    assert baseUri.endswith("/")

assert len(sys.argv) == 2, "Usage: Pass a JPEG picture filename as argument"
filename = sys.argv[1]
assert filename.lower().endswith(".jpg")

def fromRelativePath(*relativeComponents):
    return os.path.join(os.path.dirname(__file__), *relativeComponents).replace("\\","/")

def getMultipartFileData(boundary, fieldName, file):
    filename = os.path.basename(file.name)

    file.seek(0, 2)
    fileSize = file.tell()
    file.seek(0, 0)

    return "\r\n".join(("--" + boundary,
                        "Content-Disposition: form-data; name=\"%s\"; filename=\"%s\"" % (fieldName, filename),
                        "Content-Type: %s" % "application/octet-stream",
                        "Content-Length: %d" % fileSize,
                        "",
                        file.read()))

with open(filename, "rb") as f:
    boundary = "".join(random.choice(string.letters) for i in range(32))

    body = getMultipartFileData(boundary, "picture", f)
    body += "\r\n--%s--\r\n" % boundary

    client = httplib2.Http()
    response, content = client.request(baseUri + "pictures/",
                                       "PUT",
                                       body = body,
                                       headers = { "Content-Type" : "multipart/form-data; boundary=" + boundary,
                                                   "Content-Length" : str(len(body)) })
    print response
    print content