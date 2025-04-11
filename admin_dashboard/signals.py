from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.apps import apps

# This file is kept for future server-side signal handling if needed
# Currently using client-side Firebase operations
