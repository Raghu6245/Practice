from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Hardcoded test user
USER = {"username": "testuser", "password": "pass123"}

@app.route("/", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == USER["username"] and password == USER["password"]:
            return redirect(url_for("welcome"))
        else:
            error = "Invalid credentials"
    return render_template("login.html", error=error)

@app.route("/welcome")
def welcome():
    return "<h1>Welcome, you logged in successfully!</h1>"

if __name__ == "__main__":
    app.run(debug=True)
