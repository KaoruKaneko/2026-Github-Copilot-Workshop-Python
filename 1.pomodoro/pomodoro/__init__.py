from flask import Flask


def create_app() -> Flask:
    """Application factory for the Pomodoro web app."""
    app = Flask(__name__, template_folder="../templates", static_folder="../static")

    from pomodoro.routes.page_routes import page_bp

    app.register_blueprint(page_bp)
    return app
