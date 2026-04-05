import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = "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"   # 🔴 Replace this

@app.route('/')
def home():
    return "Flask server is running!"

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    if not data or not data.get("message"):
        return jsonify({"reply": "⚠️ No message provided."}), 400

    user_message = data["message"].strip()

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",   # ✅ correct URL
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",   # ✅ working model
                "messages": [
                    {"role": "user", "content": user_message}
                ]
            },
            timeout=30
        )

        print("STATUS:", response.status_code)
        print("RAW RESPONSE:", response.text)

        if response.status_code != 200:
            return jsonify({"reply": f"⚠️ API Error {response.status_code}"}), 500

        api_data = response.json()
        reply = api_data["choices"][0]["message"]["content"]

    except Exception as e:
        print("ERROR:", str(e))
        reply = "⚠️ Server error"

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True)