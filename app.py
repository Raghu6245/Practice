from flask import Flask, render_template, request, redirect, url_for, session, flash
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# File to store user data
USERS_FILE = 'users.json'

def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def authenticate_user(username, password):
    """Check if user credentials are valid"""
    users = load_users()
    user = users.get(username)
    if user and user['password'] == password:
        return user
    return None

def register_user(username, password, email, full_name):
    """Register a new user"""
    users = load_users()
    if username in users:
        return False
    
    users[username] = {
        'password': password,
        'email': email,
        'full_name': full_name,
        'created_at': datetime.now().isoformat(),
        'last_login': None
    }
    save_users(users)
    return True

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        
        user = authenticate_user(username, password)
        if user:
            session['username'] = username
            session['logged_in'] = True
            
            # Update last login
            users = load_users()
            users[username]['last_login'] = datetime.now().isoformat()
            save_users(users)
            
            flash(f"Welcome back, {user['full_name']}!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid username or password", "error")
    
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")
        full_name = request.form.get("full_name")
        
        if not all([username, password, email, full_name]):
            flash("All fields are required", "error")
        elif register_user(username, password, email, full_name):
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash("Username already exists", "error")
    
    return render_template("register.html")

@app.route("/dashboard")
def dashboard():
    if not session.get('logged_in'):
        flash("Please log in to access the dashboard", "error")
        return redirect(url_for("login"))
    
    username = session.get('username')
    users = load_users()
    user = users.get(username)
    
    return render_template("dashboard.html", user=user, username=username)

@app.route("/profile")
def profile():
    if not session.get('logged_in'):
        flash("Please log in to access your profile", "error")
        return redirect(url_for("login"))
    
    username = session.get('username')
    users = load_users()
    user = users.get(username)
    
    return render_template("profile.html", user=user, username=username)

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out successfully", "info")
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
