from waitress import serve
from app import app
import os

if __name__ == "__main__":
    print("serving ;)")
    serve(app, host='0.0.0.0', 
          port=int(os.environ.get('PORT', 8080)), 
          threads=1,
         )
