# Esto configura la conexión a la base de datos (SQLite)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./app.db"

# Engine = conexión “principal”
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal = sesiones para hacer queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = de acá heredan los modelos (tablas)
class Base(DeclarativeBase):
    pass


# Dependencia: nos da una sesión y la cierra al final
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
