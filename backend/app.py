from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import joblib
import numpy as np

# 1. LOAD THE REGRESSOR
model = joblib.load("wellness_regressor.pkl")

# 2. CONFIGURATION
url = "https://xlhuepbmxxgozminuoqx.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsaHVlcGJteHhnb3ptaW51b3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTYyNDQsImV4cCI6MjA4OTM5MjI0NH0.rH59hT6YoWkkyrNdV4V95qGR5GToBXjaUN5MmOzR4MY"
supabase: Client = create_client(url, key)

app = Flask(__name__)
CORS(app) 

CAT_NAMES = [
    "Emotional Instability", 
    "Home Environment", 
    "Academic", 
    "Screen Dependency", 
    "Sleep Debt", 
    "Social Isolation"
]

PLANS = {
    "Academic": ["Day 1: Audit your syllabus", "Day 2: 25-min Pomodoro focus", "Day 3: Clear your desk", "Day 4: Join a study group", "Day 5: Practice active recall", "Day 6: Review weak spots", "Day 7: Full mock test"],
    "Sleep Debt": ["Day 1: No screens 1hr before bed", "Day 2: Set a strict wake-up time", "Day 3: 15-min morning sun", "Day 4: No caffeine after 2PM", "Day 5: Cool/dark room setup", "Day 6: Guided sleep meditation", "Day 7: Consistent 8-hour rest"],
    "Home Environment": ["Day 1: 5-min honest talk", "Day 2: Set a study boundary", "Day 3: Share a meal together", "Day 4: Create a 'quiet zone'", "Day 5: Journal your feelings", "Day 6: Do a shared house chore", "Day 7: Plan a family walk"],
    "Social Isolation": ["Day 1: Text one old friend", "Day 2: Eat in a public space", "Day 3: Complement a peer", "Day 4: Join a student club", "Day 5: Call a family member", "Day 6: Attend a group event", "Day 7: Plan a meetup"],
    "Screen Dependency": ["Day 1: Delete 1 distractor app", "Day 2: No phone during meals", "Day 3: 20-min digital hobby", "Day 4: Gray-scale screen mode", "Day 5: One hour phone-free walk", "Day 6: Read a physical book", "Day 7: Full digital detox day"],
    "Emotional Instability": ["Day 1: Write 3 gratitudes", "Day 2: 5-min deep breathing", "Day 3: Label your emotions", "Day 4: 10-min light exercise", "Day 5: Listen to calm music", "Day 6: Avoid 'all-or-nothing' talk", "Day 7: Reflection journal"]
}

# --- NEW: AUTHENTICATION ROUTES ---

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        # Check if username already exists
        check = supabase.table("users").select("*").eq("username", data['username']).execute()
        if len(check.data) > 0:
            return jsonify({"status": "error", "message": "Username already taken"}), 400
        
        # Insert new user
        res = supabase.table("users").insert({
            "name": data['name'],
            "username": data['username'],
            "password": data['password'], # Note: In production, use hashing!
            "age": data['age'],
            "gender": data['gender']
        }).execute()
        return jsonify({"status": "success", "user": res.data[0]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    try:
        res = supabase.table("users").select("*").eq("username", data['username']).eq("password", data['password']).execute()
        if len(res.data) > 0:
            return jsonify({"status": "success", "user": res.data[0]})
        return jsonify({"status": "error", "message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/history/<username>", methods=["GET"])
def get_history(username):
    try:
        res = supabase.table("wellness_responses").select("*").eq("username", username).order("created_at", desc=True).execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# --- UPDATED: ANALYZE ROUTE ---

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    answers = data.get("answers")
    username = data.get("username") # Received from React state

    if not answers or len(answers) != 25:
        return jsonify({"error": "Invalid input. 25 answers required."}), 400

    # AI Prediction Logic
    input_array = np.array(answers).reshape(1, -1)
    predictions = model.predict(input_array)[0] 

    cat_results = {CAT_NAMES[i]: round(float(predictions[i]), 2) for i in range(len(CAT_NAMES))}

    sorted_results = sorted(cat_results.items(), key=lambda x: x[1], reverse=True)
    p1, p2 = sorted_results[0][0], sorted_results[1][0]

    avg_intensity = np.mean(predictions)
    level = "High" if avg_intensity > 70 else "Medium" if avg_intensity > 40 else "Low"

    try:
        # Now storing with username to link the assessment to the user
        supabase.table("wellness_responses").insert({
            "username": username,
            "answers": answers,
            "cat_scores": cat_results,
            "priority_1": p1, 
            "priority_2": p2, 
            "stress_level": level
        }).execute()
    except Exception as e:
        print(f"DB Error: {e}")

    return jsonify({
        "status": "success",
        "priority_1": p1,
        "priority_2": p2,
        "stress_level": level,
        "category_percentages": cat_results,
        "seven_day_plan": PLANS.get(p1, ["Keep moving forward!"])
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)