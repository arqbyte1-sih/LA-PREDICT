from app.database.connection import Base, engine
from app import models


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("LAPREDICT database tables created successfully.")