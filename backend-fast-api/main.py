# main.py
import os
import requests
from fastapi import FastAPI, HTTPException, Body
from dotenv import load_dotenv

# Load environment variables from .env file (if present)
load_dotenv()

IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_SERVICE_CRN = os.getenv("IBM_SERVICE_CRN")

if not IBM_API_KEY or not IBM_SERVICE_CRN:
    raise RuntimeError("Please set IBM_API_KEY and IBM_SERVICE_CRN in environment variables or .env file.")

app = FastAPI(title="Qiskit Runtime REST API MVP", version="0.2.0")


def get_token():
    """Get a fresh IAM bearer token from IBM Cloud IAM."""
    resp = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": IBM_API_KEY,
        },
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()["access_token"]


@app.get("/api/backends")
def list_backends():
    """List available IBM Quantum backends."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }
    resp = requests.get("https://quantum-computing.ibm.com/api/v1/backends", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/programs")
def list_programs():
    """List available Qiskit Runtime programs."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }
    resp = requests.get("https://quantum-computing.ibm.com/api/v1/programs", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/program/{program_id}")
def get_program(program_id: str):
    """Get details of a specific Qiskit Runtime program."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }
    resp = requests.get(f"https://quantum-computing.ibm.com/api/v1/programs/{program_id}", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.post("/api/job")
def create_job(body: dict = Body(...)):
    """Submit a quantum job to IBM Qiskit Runtime."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
        "Content-Type": "application/json",
    }
    resp = requests.post("https://quantum-computing.ibm.com/api/v1/jobs", headers=headers, json=body)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/jobs")
def list_jobs():
    """List all jobs for the authenticated user."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }
    resp = requests.get("https://quantum-computing.ibm.com/api/v1/jobs", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/job/{job_id}")
def get_job(job_id: str):
    """Get job status and results by job_id."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }

    status = requests.get(f"https://quantum-computing.ibm.com/api/v1/jobs/{job_id}", headers=headers)
    if status.status_code != 200:
        raise HTTPException(status_code=status.status_code, detail=status.text)

    results = requests.get(f"https://quantum-computing.ibm.com/api/v1/jobs/{job_id}/results", headers=headers)
    if results.status_code != 200:
        raise HTTPException(status_code=results.status_code, detail=results.text)

    return {
        "status": status.json(),
        "results": results.json(),
    }


@app.delete("/api/job/{job_id}")
def cancel_job(job_id: str):
    """Cancel a running job."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Service-CRN": IBM_SERVICE_CRN,
    }
    resp = requests.delete(f"https://quantum-computing.ibm.com/api/v1/jobs/{job_id}", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return {"message": f"Job {job_id} cancelled successfully."}
