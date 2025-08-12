# My Flask App

A simple Flask web application with login functionality and Playwright testing.

## Project Structure

```
my-flask-app/
├── app.py                 # Main Flask application
├── templates/
│   └── login.html        # Login page template
├── tests/
│   └── test_login.spec.ts # Playwright tests for login functionality
├── requirements.txt       # Python dependencies
├── playwright.config.ts   # Playwright configuration
└── README.md             # This file
```

## Features

- Simple login system with predefined users
- Responsive login form with validation
- Flash messages for success/error feedback
- Comprehensive test suite using Playwright

## Setup Instructions

### Prerequisites

- Python 3.7+
- Node.js 16+ (for Playwright tests)

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Playwright (for testing):**
   ```bash
   npm init -y
   npm install @playwright/test
   npx playwright install
   ```

### Running the Application

1. **Start the Flask development server:**
   ```bash
   python app.py
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

### Demo Credentials

The application comes with two predefined users:

- **Username:** `admin` | **Password:** `password123`
- **Username:** `user1` | **Password:** `mypassword`

## Testing

### Running Playwright Tests

1. **Make sure the Flask app is running:**
   ```bash
   python app.py
   ```

2. **In a new terminal, run the tests:**
   ```bash
   npx playwright test
   ```

3. **View test results:**
   ```bash
   npx playwright show-report
   ```

### Test Coverage

The test suite includes:

- Login form display validation
- Successful login with valid credentials
- Error handling for invalid credentials
- Form field validation
- Demo credentials visibility

## Development

### File Descriptions

- **`app.py`**: Main Flask application with routes for login and home page
- **`templates/login.html`**: HTML template for the login page with CSS styling
- **`tests/test_login.spec.ts`**: Playwright test specifications for login functionality
- **`requirements.txt`**: Python package dependencies
- **`playwright.config.ts`**: Configuration for Playwright testing framework

### Adding New Features

1. Add new routes in `app.py`
2. Create corresponding HTML templates in `templates/`
3. Write tests in `tests/` directory
4. Update dependencies in `requirements.txt` if needed

## Security Note

⚠️ **Important**: This is a demo application. In production:

- Use a proper database for user management
- Hash passwords securely
- Implement session management
- Add CSRF protection
- Use environment variables for configuration

## License

This project is for educational purposes only.
