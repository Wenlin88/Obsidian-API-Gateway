import requests
import urllib.parse

# Configuration
BASE_URL = "http://localhost:27124/api"  # Adjust if using a different port
AUTH_TOKEN = "my-secret-token"           # Must match plugin settings
HEADERS = {"X-API-Token": AUTH_TOKEN}

def list_all_notes():
    url = f"{BASE_URL}/notes"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        print("List All Notes Response:")
        print(response.json())
    else:
        print("Error listing notes:", response.status_code, response.text)

def read_note(file_path: str):
    encoded_path = urllib.parse.quote(file_path, safe="")
    url = f"{BASE_URL}/notes/{encoded_path}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        print(f"Read Note '{file_path}' Response:")
        print(response.json())
    else:
        print(f"Error reading note '{file_path}':", response.status_code, response.text)

def write_note(file_path: str, content: str):
    encoded_path = urllib.parse.quote(file_path, safe="")
    url = f"{BASE_URL}/notes/{encoded_path}"
    payload = {"content": content}
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code == 200:
        print(f"Write Note '{file_path}' Response:")
        print(response.json())
    else:
        print(f"Error writing note '{file_path}':", response.status_code, response.text)

if __name__ == "__main__":
    list_all_notes()
    read_note("Testi.md")
    write_note("My New Note.md", "This is the new content of My New Note.")
