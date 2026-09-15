from fastapi import FastAPI
from app.database.connection import Base, engine
from app import models
from app.api.routes.locations import router as locations_router
app = FastAPI(title="LAPREDICT Backend")
Base.metadata.create_all(bind=engine)
app.include_router(locations_router)


@app.get("/")
def read_root():
    return {"message": "LAPREDICT backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}