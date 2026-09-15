from fastapi import FastAPI

app = FastAPI(title="LAPREDICT Backend")


@app.get("/")
def read_root():
    return {"message": "LAPREDICT backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}