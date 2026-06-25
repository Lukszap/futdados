from app.database import engine
from sqlalchemy import text

conn = engine.connect()
result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
tables = [row[0] for row in result]
print('Tables:', tables)
conn.close()
