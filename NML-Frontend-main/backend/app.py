from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import random
import recommendations as rec



# === App Setup ===

app = Flask(__name__)
CORS(app, origins=["https://nm-lfinal-beta.vercel.app"], supports_credentials=True)


# === MongoDB Setup ===
client = MongoClient("mongodb+srv://nml:lLrQKKQaaL0dqgbz@cluster0.iwe1sjc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["nml"]
users = db["users"]



# === Recommendation Data Load ===
stories, worldview_keywords, keywords = rec.load_data(
    path_stories="short_stories.json",
    path_worldview_keywords="keywords_worldview.json",
    path_keywords="keywords.json"
)


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    description = data.get("description", "")
    genres = data.get("genres", [])
    min_length = data.get("min_length", 0)
    max_length = data.get("max_length", 100)

    try:
        matches = rec.recommend_stories(
            stories,
            keywords,
            description=description,
            preferred_genres=genres,
            min_length=min_length,
            max_length=max_length
        )
        matched_stories = stories.reindex(matches).to_dict(orient="records")
        return jsonify({
            "matches": matches,
            "stories": matched_stories
        })
    except Exception as e:
        return jsonify({"error": str(e)})



# === User Check ===
@app.route('/users/check', methods=['POST'])
def check_user_exists():
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    user = users.find_one({"name": username})

    if user:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200

# === Test Endpoint ===
@app.route('/random-number', methods=['GET'])
def get_random_number():
    return jsonify({"random_number": random.randint(1, 100)})

# === User Exists by Name ===
@app.route('/user-exists', methods=['GET'])
def user_exists():
    name = request.args.get("name")
    if not name:
        return jsonify({"error": "Missing name"}), 400

    user = users.find_one({"name": name})
    return jsonify({"exists": bool(user)})

# === Interaction Logging and Fetching ===
@app.route('/interact', methods=['POST'])
def log_interaction():
    data = request.json
    name = data.get("name")
    action = data.get("action")
    value = data.get("value")

    if not name or not action:
        return jsonify({"error": "Missing required fields"}), 400

    # Handle "get_interactions" action separately
    if action == "get_interactions":
        user = users.find_one({"name": name})
        if user:
            return jsonify({"interactions": user.get("interactions", [])}), 200
        else:
            return jsonify({"interactions": []}), 200

    # Log the interaction
    timestamp = datetime.utcnow().isoformat()
    interaction = {
        "action": action,
        "value": value,
        "timestamp": timestamp
    }

    user = users.find_one({"name": name})

    if user:
        users.update_one(
            {"name": name},
            {"$push": {"interactions": interaction}}
        )
    else:
        users.insert_one({
            "name": name,
            "worldview_questionnaire": {},
            "interactions": [interaction]
        })

    return jsonify({"message": "Interaction logged", "timestamp": timestamp}), 200

# === Worldview Questionnaire Saving ===
@app.route('/questionnaire', methods=['POST'])
def save_worldview_questionnaire():
    data = request.json
    name = data.get("username")
    worldview_data = data.get("worldview_questionnaire")

    if not name or not worldview_data:
        return jsonify({"error": "Missing username or worldview data"}), 400

    user = users.find_one({"name": name})
    if user:
        users.update_one(
            {"name": name},
            {"$set": {"worldview_questionnaire": worldview_data}}
        )
    else:
        users.insert_one({
            "name": name,
            "worldview_questionnaire": worldview_data,
            "interactions": []
        })

    return jsonify({"message": "Worldview questionnaire saved"}), 200

# === Poststudy Questionnaire Saving ===
@app.route('/poststudy_questionnaire', methods=['POST'])
def save_poststudy_questionnaire():
    data = request.json
    name = data.get("username")
    poststudy_data = data.get("poststudy_questionnaire")

    if not name or not poststudy_data:
        return jsonify({"error": "Missing username or poststudy questionnaire data"}), 400

    user = users.find_one({"name": name})
    if user:
        users.update_one(
            {"name": name},
            {"$set": {"poststudy_questionnaire": poststudy_data}}
        )
    else:
        users.insert_one({
            "name": name,
            "worldview_questionnaire": {},
            "poststudy_questionnaire": poststudy_data,
            "interactions": []
        })

    return jsonify({"message": "Poststudy questionnaire saved"}), 200


@app.route('/poststudy-data', methods=['POST'])
def get_poststudy_data():
    data = request.json
    name = data.get("name")

    if not name:
        return jsonify({"error": "Missing name"}), 400

    user = users.find_one({"name": name})
    if user and user.get("poststudy_questionnaire"):
        return jsonify({"has_filled_poststudy": True}), 200
    else:
        return jsonify({"has_filled_poststudy": False}), 200



# === New Endpoint: Check if worldview questionnaire exists ===
@app.route('/poststudy_questionnaire/check', methods=['POST'])
def check_poststudy_questionnaire():
    data = request.json
    name = data.get("name")

    if not name:
        return jsonify({"error": "Missing name"}), 400

    user = users.find_one({"name": name})
    if user and user.get("poststudy_questionnaire"):
        return jsonify({"has_filled_poststudy": True}), 200
    else:
        return jsonify({"has_filled_poststudy": False}), 200


# === Main ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
