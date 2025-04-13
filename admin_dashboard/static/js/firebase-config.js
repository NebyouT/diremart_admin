// Firebase configuration and initialization
(function() {
  // Check if Firebase is already initialized
  try {
    firebase.app();
  } catch (e) {
    // If not initialized, configure and initialize
    const firebaseConfig = {
      apiKey: "AIzaSyBuNrWdR_tj4TDr7wxbVGjBQ67G4uYZzoU",
      authDomain: "mulu-c4fc4.firebaseapp.com",
      projectId: "mulu-c4fc4",
      storageBucket: "mulu-c4fc4.firebasestorage.app",
      messagingSenderId: "569141222487",
      appId: "1:569141222487:web:d3ea6298f6403624125712"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }

  // Export Firebase services as global variables for easy access
  window.db = firebase.firestore();
})();
