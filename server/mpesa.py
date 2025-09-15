import requests
from flask import current_app
from base64 import b64encode
from datetime import datetime

# Safaricom Daraja sandbox credentials
MPESA_SHORTCODE = "174379"  # Your shortcode
MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"  # Your passkey
MPESA_CONSUMER_KEY = "C9YiigqIOivit9XaGC6mm6j0UHWlAc3loAwO354q6LGRVBck"
MPESA_CONSUMER_SECRET = "Vp6DFRTqMiZbgRSEOURNh4AWwgO8NjnNurwfBRLhgZzQGtAzWDAdIPvCiOF7ZAV8"
MPESA_BASE_URL = "https://sandbox.safaricom.co.ke"

def get_access_token():
    """Get OAuth token from Safaricom"""
    auth = b64encode(f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    url = f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    res = requests.get(url, headers=headers)
    res.raise_for_status()
    return res.json()["access_token"]

def lipa_na_mpesa(phone_number, amount, account_reference, transaction_desc):
    """Initiate STK Push"""
    token = get_access_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": "https://687fcc9afc1e.ngrok-free.app/mpesa/callback",
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"
    res = requests.post(url, json=payload, headers=headers)
    return res.json()
