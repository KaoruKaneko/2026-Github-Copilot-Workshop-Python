from flask import Blueprint, render_template

page_bp = Blueprint("page", __name__)


@page_bp.get("/")
def index() -> str:
    return render_template("index.html")
