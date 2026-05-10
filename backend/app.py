from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import joblib
import numpy as np
from datetime import datetime, timezone 

# 1. LOAD THE REGRESSOR
# Ensure wellness_regressor.pkl is in the same folder as this file
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
def get_integrated_guidance(dep_score, anx_score, safety_alert=False):
    # 1. IMMEDIATE SAFETY CHECK
    if safety_alert:
        return "CRITICAL SAFETY ALERT: Your responses indicate thoughts of self-harm. Please reach out to a campus counselor or a crisis resource immediately. You are not alone, and help is available 24/7."

    # 2. Total Distress (PHQ-ADS logic)
    total_distress = dep_score + anx_score
    
    # 3. Standard Decision Logic
    if dep_score >= 20 or anx_score >= 15:
        return "High Clinical Priority: Your scores suggest significant distress. We strongly recommend a direct consultation with a mental health professional this week."
    
    if dep_score >= 10 or anx_score >= 10:
        return "Moderate Distress: You're navigating significant symptoms. Scheduling a chat with a campus counselor would be a proactive next step."
    
    if total_distress >= 10:
        return "Mild to Moderate Combined Symptoms: You may be experiencing 'comorbid' stress. Focus on structured self-care and monitor your mood."
    
    return "Minimal Symptoms: Your clinical scores are within a healthy range. Continue with your current wellness habits."

# --- AUTHENTICATION ROUTES ---

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        check = supabase.table("users").select("*").eq("username", data['username']).execute()
        if len(check.data) > 0:
            return jsonify({"status": "error", "message": "Username already taken"}), 400
        
        res = supabase.table("users").insert({
            "name": data['name'],
            "username": data['username'],
            "password": data['password'], 
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

# --- ANALYZE ROUTE (Supports Standard & Clinical) ---

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    answers = data.get("answers")
    username = data.get("username")
    test_type = data.get("test_type", "standard") 

    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    # --- CASE 1: STANDARD TEST (25 Questions) ---
    if test_type == "standard":
        if len(answers) != 25:
            return jsonify({"error": "25 answers required for standard test"}), 400

        input_array = np.array(answers).reshape(1, -1)
        predictions = model.predict(input_array)[0] 
        cat_results = {CAT_NAMES[i]: round(float(predictions[i]), 2) for i in range(len(CAT_NAMES))}
        
        sorted_results = sorted(cat_results.items(), key=lambda x: x[1], reverse=True)
        p1, p2 = sorted_results[0][0], sorted_results[1][0]
        avg_intensity = np.mean(predictions)
        level = "High" if avg_intensity > 70 else "Medium" if avg_intensity > 40 else "Low"
        
        response_data = {
            "status": "success",
            "priority_1": p1,
            "priority_2": p2,
            "stress_level": level,
            "category_percentages": cat_results,
            "seven_day_plan": PLANS.get(p1, ["Keep moving forward!"])
        }

# --- CASE 2: CLINICAL SCREENING (16 Questions) ---
    else:
        if len(answers) != 16:
            return jsonify({"error": "16 answers required for clinical test"}), 400
        
        clinical_ints = [min(max(int(a) - 1, 0), 3) for a in answers]
        safety_alert = clinical_ints[8] > 0 
        dep_score = sum(clinical_ints[:9]) 
        anx_score = sum(clinical_ints[9:]) 

        dep_pct, anx_pct = (dep_score / 27), (anx_score / 21)

        # Determine priorities
        if dep_pct >= anx_pct:
            p1, p2 = "Depression", "Anxiety"
        else:
            p1, p2 = "Anxiety", "Depression"

        dep_level = "Severe" if dep_score >= 20 else "Moderate" if dep_score >= 10 else "Mild"
        anx_level = "Severe" if anx_score >= 15 else "Moderate" if anx_score >= 10 else "Mild"

        unified_guidance = get_integrated_guidance(dep_score, anx_score, safety_alert)

        # FINAL DATA FOR DATABASE AND FRONTEND
        response_data = {
            "status": "success",
            "priority_1": "SAFETY ALERT" if safety_alert else p1,
            "priority_2": p2,
            "stress_level": "CRITICAL" if safety_alert else "Clinical Follow-up",
            "category_percentages": {
                "Depression": round(dep_pct * 100, 2),
                "Anxiety": round(anx_pct * 100, 2)
            },
            "seven_day_plan": [
                unified_guidance,
                f"Focus on {p1} management" if not safety_alert else "Seek immediate help",
                "Check detailed scores in History"
            ]
        }

# --- DATABASE UPDATE ---
    try:
        # This version works on older and newer Python versions
        now = datetime.now(timezone.utc).isoformat() 
        
        # 1. Save the specific test response
        # Ensure you include all columns that your Supabase table requires
        supabase.table("wellness_responses").insert({
            "username": username,
            "test_type": test_type,
            "answers": answers,
            "stress_level": response_data.get("stress_level"),
            "cat_scores": response_data.get("category_percentages"),
            "priority_1": response_data.get("priority_1"),
            "priority_2": response_data.get("priority_2"),
            "created_at": now
        }).execute()

        # 2. Update user table for the 7-day timer
        supabase.table("users").update({"last_test_date": now}).eq("username", username).execute()
        print(f"Successfully stored {test_type} test for {username}") # Confirmation for your log
        
    except Exception as e:
        print(f"DB Error: {e}") # This will catch any missing column issues

    return jsonify(response_data)

if __name__ == "__main__":
    print("--- Attempting to start the Flask server on port 5000 ---")
    app.run(debug=True, port=5000)