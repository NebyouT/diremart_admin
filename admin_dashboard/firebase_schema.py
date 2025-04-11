from diremart.firebase_config import db
from typing import Dict, List, Any
import json

def get_collection_schema(collection_name: str) -> Dict[str, Any]:
    """
    Analyze a Firebase collection and return its schema structure
    """
    docs = db.collection(collection_name).limit(10).stream()  # Sample first 10 docs
    schema = {}
    
    for doc in docs:
        doc_data = doc.to_dict()
        for field, value in doc_data.items():
            if field not in schema:
                schema[field] = type(value).__name__
    
    return schema

def get_all_collections() -> List[str]:
    """
    Get all collection names from Firebase
    """
    collections = db.collections()
    return [collection.id for collection in collections]

def generate_django_model(collection_name: str, schema: Dict[str, Any]) -> str:
    """
    Generate Django model code based on Firebase schema
    """
    type_mapping = {
        'str': 'models.CharField(max_length=255)',
        'int': 'models.IntegerField()',
        'float': 'models.FloatField()',
        'bool': 'models.BooleanField(default=False)',
        'datetime': 'models.DateTimeField()',
        'dict': 'models.JSONField()',
        'list': 'models.JSONField()',
        'NoneType': 'models.CharField(max_length=255, null=True, blank=True)',
    }
    
    model_code = f'''
class {collection_name.title()}(models.Model):
    firebase_id = models.CharField(max_length=100, unique=True)
'''
    
    for field, field_type in schema.items():
        django_field = type_mapping.get(field_type, 'models.CharField(max_length=255)')
        model_code += f"    {field} = {django_field}\n"
    
    model_code += '''
    class Meta:
        db_table = f"firebase_{collection_name.lower()}"
        
    def to_firebase_dict(self) -> dict:
        data = {}
        for field in self._meta.fields:
            if field.name != 'id' and field.name != 'firebase_id':
                data[field.name] = getattr(self, field.name)
        return data
        
    @classmethod
    def from_firebase_dict(cls, firebase_id: str, data: dict) -> 'cls':
        data['firebase_id'] = firebase_id
        return cls(**data)
'''
    return model_code

def generate_all_models() -> str:
    """
    Generate Django models for all Firebase collections
    """
    collections = get_all_collections()
    models_code = '''from django.db import models
from datetime import datetime
'''
    
    for collection in collections:
        schema = get_collection_schema(collection)
        models_code += generate_django_model(collection, schema)
        models_code += "\n\n"
    
    return models_code
