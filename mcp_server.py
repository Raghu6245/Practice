from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

REPO_DIR = "repo"

def git_clone_or_pull(repo_url, branch):
    if os.path.exists(REPO_DIR):
        result = subprocess.run(
            ["git", "-C", REPO_DIR, "pull"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return False, result.stderr
    else:
        result = subprocess.run(
            ["git", "clone", "--branch", branch, repo_url, REPO_DIR],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return False, result.stderr
    return True, ""

@app.route("/run-tests", methods=["POST"])
def run_tests():
    data = request.json
    branch = data.get("branch", "main")
    repo_url = data.get("repo")

    if not repo_url:
        return jsonify({"error": "Missing 'repo' URL in request"}), 400

    success, msg = git_clone_or_pull(repo_url, branch)
    if not success:
        return jsonify({"error": f"Git error: {msg}"}), 500

    try:
        result = subprocess.run(
            ["npx", "playwright", "test", "--reporter=json"],
            cwd=REPO_DIR,
            capture_output=True,
            text=True,
            shell=True,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if result.returncode != 0 and not result.stdout:
        return jsonify({"error": result.stderr}), 500

    try:
        test_results = result.stdout
        return jsonify({"testResults": test_results})
    except Exception as e:
        return jsonify({"error": f"Failed to parse Playwright output: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
