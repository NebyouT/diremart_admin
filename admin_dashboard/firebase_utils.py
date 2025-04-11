from diremart.firebase_config import db
from typing import Dict, Any, List, Optional

class FirebaseManager:
    @staticmethod
    async def create_document(collection: str, data: Dict[str, Any], document_id: Optional[str] = None) -> str:
        """Create a new document in Firestore."""
        if document_id:
            doc_ref = db.collection(collection).document(document_id)
            doc_ref.set(data)
            return document_id
        else:
            doc_ref = db.collection(collection).add(data)
            return doc_ref[1].id

    @staticmethod
    def get_document(collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a document from Firestore."""
        doc_ref = db.collection(collection).document(document_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None

    @staticmethod
    def update_document(collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Update a document in Firestore."""
        doc_ref = db.collection(collection).document(document_id)
        doc_ref.update(data)
        return True

    @staticmethod
    def delete_document(collection: str, document_id: str) -> bool:
        """Delete a document from Firestore."""
        doc_ref = db.collection(collection).document(document_id)
        doc_ref.delete()
        return True

    @staticmethod
    def get_all_documents(collection: str) -> List[Dict[str, Any]]:
        """Retrieve all documents from a collection."""
        docs = db.collection(collection).stream()
        return [{**doc.to_dict(), 'id': doc.id} for doc in docs]

    @staticmethod
    def query_documents(collection: str, field: str, operator: str, value: Any) -> List[Dict[str, Any]]:
        """Query documents based on field conditions."""
        docs = db.collection(collection).where(field, operator, value).stream()
        return [{**doc.to_dict(), 'id': doc.id} for doc in docs]
