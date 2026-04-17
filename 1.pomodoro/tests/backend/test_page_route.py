from pomodoro import create_app


def test_index_page_is_served() -> None:
    app = create_app()
    client = app.test_client()

    response = client.get("/")

    assert response.status_code == 200
    assert "Pomodoro Timer" in response.get_data(as_text=True)
