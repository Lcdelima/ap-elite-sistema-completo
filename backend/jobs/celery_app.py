"""Celery App Configuration - Elite Athena"""
import os
from celery import Celery

# Celery app
app = Celery("athena_pericia")

# Configuration
app.conf.broker_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app.conf.result_backend = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]
app.conf.timezone = "America/Sao_Paulo"
app.conf.enable_utc = True

# Task routes
app.conf.task_routes = {
    'pericia.*': {'queue': 'pericia'},
    'transcription.*': {'queue': 'transcription'},
    'deepfake.*': {'queue': 'deepfake'}
}

# Autodiscover tasks
app.autodiscover_tasks(['backend.jobs'])

if __name__ == '__main__':
    app.start()
