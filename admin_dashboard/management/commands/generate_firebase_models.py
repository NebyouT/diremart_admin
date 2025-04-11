from django.core.management.base import BaseCommand
from admin_dashboard.firebase_schema import generate_all_models
import os

class Command(BaseCommand):
    help = 'Generate Django models from Firebase collections'

    def handle(self, *args, **options):
        try:
            # Generate the models code
            models_code = generate_all_models()
            
            # Write to models.py
            models_path = os.path.join('admin_dashboard', 'firebase_models.py')
            with open(models_path, 'w') as f:
                f.write(models_code)
            
            self.stdout.write(
                self.style.SUCCESS('Successfully generated models in firebase_models.py')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error generating models: {str(e)}')
            )
