"""
Web service implementation for the sample application MobiPrint, written using the Bottle web framework.

Requires bottle (http://bottlepy.org/) which can be installed with "pip install bottle" (tested with v0.11).

Note that an automatically reloading development server is started when you run this script.
"""

import bottle
from bottle import abort, post, put, request, response, route
from PIL import Image
from itertools import chain
import os
import hashlib
import json
import random
import re
import shutil
import tempfile
import threading
import time
from StringIO import StringIO
import datetime

class UtcTimeZone(datetime.tzinfo):
    def utcoffset(self, dt):
        return datetime.timedelta(0)

def tzDatetimeNow():
    return datetime.datetime.utcnow().replace(tzinfo = UtcTimeZone())

# Only works within one Python interpreter of course, but at least do some basic locking
pictureWriteLock = threading.RLock()
dbWriteLock = threading.RLock()

def fromRelativePath(*relativeComponents):
    return os.path.join(os.path.dirname(__file__), *relativeComponents).replace("\\","/")

# Setting different in testing (Windows) and production (Linux)
productionMode = os.name != "nt"
bottle.debug(not productionMode)
PICTURE_DIRECTORY = "/tmp/mobiprint-picture-upload" if productionMode else fromRelativePath("picture-upload")
DATABASE_FILENAME = "/tmp/mobiprint-web-service-db.json" if productionMode else fromRelativePath("database", "mobiprint-web-service-db.json")

# Picture filenames are always named <id>.<sha1>.jpg
PICTURE_REGEX = re.compile(r"^[1-9]\d{0,9}\.[a-f0-9]{40}\.jpg$")

if not os.path.exists(PICTURE_DIRECTORY):
    os.mkdir(PICTURE_DIRECTORY)
if not os.path.exists(os.path.dirname(DATABASE_FILENAME)):
    os.mkdir(os.path.dirname(DATABASE_FILENAME))
if not os.path.exists(DATABASE_FILENAME):
    with open(DATABASE_FILENAME, "wb") as f:
        json.dump({"orders" : []}, f, sort_keys = True, indent = 2)

HOMEPAGE = """
<html>
<body>
    <h1>Web service for the MobiPrint sample application</h1>
    <p>See <a href="https://andidogs.dyndns.org/links/~thesis-web-service-homepage/">my master's thesis</a> for further details.</p>
</body>
</html>
""".strip()

def checkId(id):
    if not (1 <= id < 2**31):
        abort(400, "Invalid picture ID")

@route("/")
def home():
    return HOMEPAGE

@route("/orders/")
def orders():
    with dbWriteLock:
        with open(DATABASE_FILENAME, "rb") as f:
            db = json.load(f)

    return {"orders" : db["orders"]}

@route("/picture/<id:int>/thumbnail/")
def thumbnail(id):
    checkId(id)

    size = request.GET.get("size", 0)
    try:
        size = int(size)
        if size < 5 or size > 500:
            raise ValueError
    except ValueError:
        abort(400, "Size must be a number between 5 and 500")

    matchingFilenames = [filename
                         for filename in os.listdir(PICTURE_DIRECTORY)
                         if filename.startswith(str(id) + ".") and PICTURE_REGEX.match(filename)]

    if not matchingFilenames:
        abort(404, "Picture not found")

    if len(matchingFilenames) > 1:
        # This should not happen (unless the poor locking mechanism leads to a race condition ;)
        raise AssertionError("Multiple picture files with the same ID found")

    matchingFilename = os.path.join(PICTURE_DIRECTORY, matchingFilenames[0])
    with open(matchingFilename, "rb") as f:
        img = Image.open(f)
        img.load()
    img.thumbnail((size, size), Image.ANTIALIAS)

    stream = StringIO()
    img.save(stream, "JPEG", quality = 60)

    # Note: If-Modified-Since not supported here

    stats = os.stat(matchingFilename)

    response.set_header("Content-Length", stream.len)
    response.set_header("Expires", "Sun, 17-Jan-2038 19:14:07 GMT")
    response.set_header("Last-Modified", time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(stats.st_mtime)))
    response.content_type = "image/jpeg"

    stream.seek(0)
    return stream

@post("/order/<id:int>/submit/")
def submitOrder(id):
    checkId(id)

    username, password = request.POST.get("username", None), request.POST.get("password", None)

    if not username or not password:
        abort(400, "Missing username or password parameter")

    with dbWriteLock:
        with open(DATABASE_FILENAME, "r+b") as f:
            db = json.load(f)

            matchingOrders = [order for order in db["orders"] if order["id"] == id]

            if not matchingOrders:
                abort(404, "Order not found")
            if len(matchingOrders) > 1:
                raise AssertionError("Multiple orders with the same ID found")

            order = matchingOrders[0]

            # Remove second fragment from date string (result e.g. "2012-04-16T13:24:29+00:00")
            order["submissionDate"] = re.sub(r"\.\d+(\+\d\d:\d\d)$", r"\1", tzDatetimeNow().isoformat())

            f.seek(0)
            json.dump(db, f, sort_keys = True, indent = 2)
            f.truncate()

    return {"order" : order}

@put("/pictures/")
def uploadPicture():
    picture = request.files.picture

    # Bottle is a bit stupid in that it uses cgi.FieldStorage for a file or u"" for a non-existing field
    if picture == "" or not picture.value or not picture.filename:
        abort(400, "No file or filename given")

    tmpFilename = os.path.join(tempfile.gettempdir(), "mobiprint-web-service-%d.tmp" % random.randint(0, 2**40))
    tmpFile = open(tmpFilename, "w+b")

    try:
        sha1Hash = hashlib.sha1()
        length = 0
        buf = picture.file.read(32768)
        while buf:
            length += len(buf)

            # 2 MB limit
            if length > 2**21:
                abort(400, "File size exceeds 2 MB limit")

            tmpFile.write(buf)
            sha1Hash.update(buf)
            buf = picture.file.read(32768)

        tmpFile.flush()

        try:
            tmpFile.seek(0)
            img = Image.open(tmpFile)
            img.load()

            tmpFile.close()

            if img.format != "JPEG":
                abort(400, "Only JPEG pictures supported")

            if any(sideLength < 1 or sideLength > 4000 for sideLength in img.size):
                abort(400, "Image dimensions not accepted (must be 1-4000 per side)")
        except Exception as e:
            abort(400, "Failed to load picture, probably invalid format (%s)" % e)

        sha1 = sha1Hash.hexdigest()

        with pictureWriteLock:
            jpgFilenames = [filename for filename in os.listdir(PICTURE_DIRECTORY) if PICTURE_REGEX.match(filename)]

            for filename in jpgFilenames:
                if filename[-44:-4] == sha1:
                    pictureId = int(filename[:-45])
                    break
            else:
                maxIdOrZero = max(chain((int(filename[:-45]) for filename in jpgFilenames), [0]))

                pictureId = maxIdOrZero + 1
                pictureFilename = os.path.join(PICTURE_DIRECTORY, "%d.%s.jpg" % (pictureId, sha1))
                assert PICTURE_REGEX.match(os.path.basename(pictureFilename))

                shutil.copy(tmpFilename, pictureFilename)

        # Add picture to current order
        with dbWriteLock:
            with open(DATABASE_FILENAME, "r+b") as f:
                db = json.load(f)

                dbChanged = False

                for order in db["orders"][::-1]:
                    if order["submissionDate"] is None:
                        if pictureId not in order["pictureIds"][::-1]:
                            order["pictureIds"].append(pictureId)
                            dbChanged = True
                        break
                else:
                    # No current order exists, create one
                    orderId = max(chain((order["id"] for order in db["orders"]), [0])) + 1

                    order = {"id" : orderId,
                             "pictureIds" : [pictureId],
                             "submissionDate" : None}
                    db["orders"].append(order)
                    dbChanged = True

                if dbChanged:
                    f.seek(0)
                    json.dump(db, f, sort_keys = True, indent = 2)
                    f.truncate()

        # Return HTTP 201 even if a picture file with the same SHA-1 hash already existed, semantically the PUT "created" a picture
        response.status = 201

        return {"picture" : {"id" : pictureId},
                "order" : order}
    finally:
        if not tmpFile.closed:
            tmpFile.close()
        os.remove(tmpFilename)

if __name__ == "__main__":
    bottle.run(host = "localhost", port = 8087, reloader = True)