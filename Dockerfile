# WHO? IS IT? — single-container build. Serves the game + room-sync WebSocket on one port.
FROM python:3.12-slim
WORKDIR /app
COPY . /app
# Most hosts inject $PORT; default to 8080 for local `docker run`.
ENV PORT=8080
EXPOSE 8080
CMD ["python3", "-u", "relay.py"]
