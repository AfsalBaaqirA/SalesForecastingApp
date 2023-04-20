from flask import Flask
from flask_cors import CORS

from endpoints import api_endpoints


def create_app():
    app = Flask(__name__)
    CORS(app)
    api_endpoints(app)
    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='192.168.1.96')
