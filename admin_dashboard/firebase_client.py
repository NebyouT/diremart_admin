from django.conf import settings

class FirebaseClient:
    @staticmethod
    def get_config():
        return {
            'apiKey': "AIzaSyBuNrWdR_tj4TDr7wxbVGjBQ67G4uYZzoU",
            'authDomain': "mulu-c4fc4.firebaseapp.com",
            'projectId': "mulu-c4fc4",
            'storageBucket': "mulu-c4fc4.firebasestorage.app",
            'messagingSenderId': "569141222487",
            'appId': "1:569141222487:web:d3ea6298f6403624125712"
        }
