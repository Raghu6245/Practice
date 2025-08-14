from flask import Flask, render_template, request, redirect, url_for, session, flash
import json
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# File to store users (in production, use a proper database)
USERS_FILE = 'users.json'

def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {"testuser": {"password": "pass123", "email": "test@example.com", "created_at": "2025-01-01"}}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def is_logged_in():
    """Check if user is logged in"""
    return 'username' in session

@app.route("/", methods=["GET", "POST"])
def login():
    if is_logged_in():
        return redirect(url_for("dashboard"))
    
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        users = load_users()
        
        if username in users and users[username]["password"] == password:
            session['username'] = username
            flash(f'Welcome back, {username}!', 'success')
            return redirect(url_for("dashboard"))
        else:
            error = "Invalid credentials"
            flash('Invalid username or password', 'error')
    
    return render_template("login.html", error=error)

@app.route("/register", methods=["GET", "POST"])
def register():
    if is_logged_in():
        return redirect(url_for("dashboard"))
    
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")
        
        if not username or not password or not email:
            error = "All fields are required"
        elif len(password) < 6:
            error = "Password must be at least 6 characters"
        else:
            users = load_users()
            if username in users:
                error = "Username already exists"
            else:
                # Add new user
                from datetime import datetime
                users[username] = {
                    "password": password,
                    "email": email,
                    "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                save_users(users)
                flash('Registration successful! Please log in.', 'success')
                return redirect(url_for("login"))
        
        if error:
            flash(error, 'error')
    
    return render_template("register.html", error=error)

@app.route("/dashboard")
def dashboard():
    if not is_logged_in():
        flash('Please log in to access the dashboard', 'error')
        return redirect(url_for("login"))
    
    username = session['username']
    users = load_users()
    user_info = users.get(username, {})
    
    return render_template("dashboard.html", username=username, user_info=user_info)

@app.route("/profile")
def profile():
    if not is_logged_in():
        flash('Please log in to access your profile', 'error')
        return redirect(url_for("login"))
    
    username = session['username']
    users = load_users()
    user_info = users.get(username, {})
    
    return render_template("profile.html", username=username, user_info=user_info)

@app.route("/logout")
def logout():
    username = session.get('username', 'User')
    session.clear()
    flash(f'Goodbye, {username}! You have been logged out.', 'info')
    return redirect(url_for("login"))

# Legacy route for backward compatibility
@app.route("/welcome")
def welcome():
    if is_logged_in():
        return redirect(url_for("dashboard"))
    return "<h1>Welcome, you logged in successfully!</h1><p><a href='/login'>Login here</a></p>"

if __name__ == "__main__":
    app.run(debug=True)
