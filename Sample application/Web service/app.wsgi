import codecs # necessary because of 'no codec search functions registered' problem with mod_wsgi
import bottle

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import web_service
sys.path = sys.path[1:]

application = bottle.default_app()