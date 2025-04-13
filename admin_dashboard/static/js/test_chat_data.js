// Test script to populate Firebase with sample chat data
// Run this script once to create test data for the customer support chat system

function populateTestData() {
    // Check if Firebase is initialized
    if (!firebase || !firebase.firestore) {
        console.error('Firebase is not initialized');
        return;
    }
    
    const db = firebase.firestore();
    
    // Sample user data
    const users = [
        {
            uid: 'user1',
            displayName: 'John Doe',
            email: 'john.doe@example.com',
            chats: [
                {
                    chatId: 'chat1',
                    lastMessage: 'I need help with my order',
                    lastMessageTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
                    status: 'open',
                    unreadCount: 2,
                    messages: [
                        {
                            content: 'Hello, I need help with my order #12345',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 7200000)), // 2 hours ago
                            read: false,
                            userId: 'user1'
                        },
                        {
                            content: 'The items I received are not what I ordered',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
                            read: false,
                            userId: 'user1'
                        }
                    ]
                }
            ]
        },
        {
            uid: 'user2',
            displayName: 'Jane Smith',
            email: 'jane.smith@example.com',
            chats: [
                {
                    chatId: 'chat1',
                    lastMessage: 'Thank you for your help!',
                    lastMessageTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
                    status: 'closed',
                    unreadCount: 0,
                    messages: [
                        {
                            content: 'Hi, I have a question about your return policy',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 172800000)), // 2 days ago
                            read: true,
                            userId: 'user2'
                        },
                        {
                            content: 'Our return policy allows returns within 30 days of purchase. Is there something specific you need help with?',
                            isFromUser: false,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 158400000)), // 1 day and 20 hours ago
                            read: true,
                            userId: 'user2'
                        },
                        {
                            content: 'That answers my question. Thank you for your help!',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
                            read: true,
                            userId: 'user2'
                        }
                    ]
                }
            ]
        },
        {
            uid: 'user3',
            displayName: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            chats: [
                {
                    chatId: 'chat1',
                    lastMessage: 'When will my order be shipped?',
                    lastMessageTime: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)), // 30 minutes ago
                    status: 'open',
                    unreadCount: 1,
                    messages: [
                        {
                            content: 'Hello, I placed an order yesterday (Order #54321) and I was wondering when it will be shipped?',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)), // 30 minutes ago
                            read: false,
                            userId: 'user3'
                        }
                    ]
                }
            ]
        },
        {
            uid: 'WhAP6poAgcWaDUVjgxbYM8fAGZF3',
            displayName: 'Example Customer',
            email: 'example.customer@example.com',
            chats: [
                {
                    chatId: 'chat1',
                    lastMessage: "We've received your message and will respond as soon as possible.",
                    lastMessageTime: firebase.firestore.Timestamp.fromDate(new Date('2025-04-12T20:24:14.000Z')), // April 12, 2025 at 11:24:14 PM UTC+3
                    status: 'open',
                    unreadCount: 0,
                    messages: [
                        {
                            content: 'Hello, I have a question about my recent purchase.',
                            isFromUser: true,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date('2025-04-12T20:20:00.000Z')),
                            read: true,
                            userId: 'WhAP6poAgcWaDUVjgxbYM8fAGZF3'
                        },
                        {
                            content: "We've received your message and will respond as soon as possible.",
                            isFromUser: false,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date('2025-04-12T20:24:14.000Z')), // April 12, 2025 at 11:24:14 PM UTC+3
                            read: true,
                            userId: 'WhAP6poAgcWaDUVjgxbYM8fAGZF3'
                        }
                    ]
                }
            ]
        }
    ];
    
    // Add data to Firestore
    const batch = db.batch();
    
    users.forEach(user => {
        // Create user document
        const userRef = db.collection('users').doc(user.uid);
        batch.set(userRef, {
            displayName: user.displayName,
            email: user.email
        });
        
        // Add chats for this user
        user.chats.forEach(chat => {
            const chatRef = userRef.collection('chats').doc(chat.chatId);
            batch.set(chatRef, {
                lastMessage: chat.lastMessage,
                lastMessageTime: chat.lastMessageTime,
                status: chat.status,
                unreadCount: chat.unreadCount
            });
            
            // Add messages for this chat
            chat.messages.forEach((message, index) => {
                const messageRef = chatRef.collection('messages').doc(`msg${index + 1}`);
                batch.set(messageRef, {
                    content: message.content,
                    isFromUser: message.isFromUser,
                    timestamp: message.timestamp,
                    read: message.read,
                    userId: message.userId
                });
            });
        });
    });
    
    // Commit the batch
    batch.commit()
        .then(() => {
            console.log('Test data added successfully');
            alert('Test data added successfully. Refresh the page to see the chats.');
        })
        .catch(error => {
            console.error('Error adding test data:', error);
            alert(`Error adding test data: ${error.message}`);
        });
}

// Add a button to the page to run the test
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const testButton = document.createElement('button');
    testButton.className = 'fixed bottom-4 right-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium';
    testButton.textContent = 'Add Test Data';
    testButton.addEventListener('click', populateTestData);
    
    document.body.appendChild(testButton);
});
