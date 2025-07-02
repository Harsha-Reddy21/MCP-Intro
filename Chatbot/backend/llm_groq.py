import requests
import os
import json

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama3-70b-8192"

def query_llama(prompt):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        
        response_data = response.json()
        
        # Debug: print response structure (remove in production)
        print(f"Groq API Response: {json.dumps(response_data, indent=2)}")
        
        # Check if response has expected structure
        if "choices" not in response_data:
            raise ValueError(f"Unexpected response structure: {response_data}")
        
        if not response_data["choices"]:
            raise ValueError("No choices in response")
        
        if "message" not in response_data["choices"][0]:
            raise ValueError("No message in first choice")
        
        return response_data["choices"][0]["message"]["content"]
        
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to Groq API failed: {str(e)}")
    except KeyError as e:
        raise ValueError(f"Unexpected response format from Groq API: missing key {str(e)}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON response from Groq API: {str(e)}")