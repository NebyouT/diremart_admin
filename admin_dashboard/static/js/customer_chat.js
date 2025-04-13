// Customer Support Chat System
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatLoading = document.getElementById('chat-loading');
    const chatContainer = document.getElementById('chat-container');
    const chatList = document.getElementById('chat-list');
    const noChatsMessage = document.getElementById('no-chats-message');
    const noChatSelected = document.getElementById('no-chat-selected');
    const chatConversation = document.getElementById('chat-conversation');
    const chatMessages = document.getElementById('chat-messages');
    const chatCustomerName = document.getElementById('chat-customer-name');
    const chatCustomerEmail = document.getElementById('chat-customer-email');
    const chatStatusBadge = document.getElementById('chat-status-badge');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    const refreshBtn = document.getElementById('refresh-btn');
    const chatStatusUpdate = document.getElementById('chat-status-update');
    const updateStatusBtn = document.getElementById('update-status-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    
    // Firebase Configuration
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
    const db = firebase.firestore();
    
    // Variables
    let allChats = [];
    let currentUserId = null;
    let currentChatId = null;
    let messagesListener = null;
    
    // Load all chats
    function loadChats() {
        chatLoading.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        allChats = [];
        
        // Get all users with chats
        db.collection('users').get()
            .then(usersSnapshot => {
                const promises = [];
                
                usersSnapshot.forEach(userDoc => {
                    const userId = userDoc.id;
                    const userData = userDoc.data();
                    
                    // Get chats for this user
                    const promise = db.collection('users').doc(userId).collection('chats').get()
                        .then(chatsSnapshot => {
                            if (chatsSnapshot.empty) return;
                            
                            chatsSnapshot.forEach(chatDoc => {
                                const chatData = chatDoc.data();
                                allChats.push({
                                    userId: userId,
                                    chatId: chatDoc.id,
                                    displayName: userData.displayName || 'Unknown User',
                                    email: userData.email || 'No Email',
                                    lastMessage: chatData.lastMessage || 'No messages yet',
                                    lastMessageTime: chatData.lastMessageTime || { seconds: 0 },
                                    status: chatData.status || 'open',
                                    unreadCount: chatData.unreadCount || 0
                                });
                            });
                        });
                    
                    promises.push(promise);
                });
                
                return Promise.all(promises);
            })
            .then(() => {
                renderChats();
                chatLoading.classList.add('hidden');
                chatContainer.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error loading chats:', error);
                showNotification(`Error loading chats: ${error.message}`, 'error');
                chatLoading.classList.add('hidden');
                chatContainer.classList.remove('hidden');
            });
    }
    
    // Render chats in the list
    function renderChats() {
        // Clear existing chats
        chatList.innerHTML = '';
        
        // Filter chats based on status
        let filteredChats = allChats;
        const statusValue = statusFilter.value;
        
        if (statusValue !== 'all') {
            filteredChats = filteredChats.filter(chat => chat.status === statusValue);
        }
        
        // Sort chats
        const sortValue = sortBy.value;
        
        if (sortValue === 'newest') {
            filteredChats.sort((a, b) => (b.lastMessageTime?.seconds || 0) - (a.lastMessageTime?.seconds || 0));
        } else if (sortValue === 'oldest') {
            filteredChats.sort((a, b) => (a.lastMessageTime?.seconds || 0) - (b.lastMessageTime?.seconds || 0));
        } else if (sortValue === 'unread') {
            filteredChats.sort((a, b) => b.unreadCount - a.unreadCount);
        }
        
        // Show no chats message if no chats
        if (filteredChats.length === 0) {
            noChatsMessage.classList.remove('hidden');
        } else {
            noChatsMessage.classList.add('hidden');
            
            // Render each chat
            filteredChats.forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = 'p-4 hover:bg-gray-50 cursor-pointer';
                chatItem.dataset.userId = chat.userId;
                chatItem.dataset.chatId = chat.chatId;
                
                // Format last message time
                const lastMessageDate = chat.lastMessageTime?.seconds 
                    ? new Date(chat.lastMessageTime.seconds * 1000) 
                    : new Date();
                const formattedDate = formatDate(lastMessageDate);
                
                // Create unread badge if needed
                const unreadBadge = chat.unreadCount > 0 
                    ? `<span class="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">${chat.unreadCount}</span>` 
                    : '';
                
                // Create status badge
                const statusBadge = `<span class="${getStatusBadgeColor(chat.status)} text-xs font-medium px-2.5 py-0.5 rounded-full">${chat.status}</span>`;
                
                chatItem.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-medium text-gray-900 truncate">${chat.displayName}</h3>
                        <span class="text-xs text-gray-500">${formattedDate}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-sm text-gray-500 truncate max-w-[70%]">${chat.lastMessage}</p>
                        <div class="flex items-center gap-2">
                            ${unreadBadge}
                            ${statusBadge}
                        </div>
                    </div>
                `;
                
                // Add click event to load chat messages
                chatItem.addEventListener('click', () => {
                    loadChatMessages(chat.userId, chat.chatId, chat.displayName, chat.email, chat.status);
                });
                
                chatList.appendChild(chatItem);
            });
        }
    }
    
    // Load chat messages for a specific chat
    function loadChatMessages(userId, chatId, displayName, email, status) {
        // Detach previous listener if exists
        if (messagesListener) {
            messagesListener();
        }
        
        // Show loading in messages area
        chatMessages.innerHTML = `
            <div class="flex justify-center items-center h-full">
                <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        
        // Update UI
        noChatSelected.classList.add('hidden');
        chatConversation.classList.remove('hidden');
        chatCustomerName.textContent = displayName;
        chatCustomerEmail.textContent = email;
        chatStatusBadge.textContent = status;
        chatStatusBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`;
        chatStatusUpdate.value = status;
        
        // Store current chat info
        currentUserId = userId;
        currentChatId = chatId;
        
        // Set up real-time listener for messages
        messagesListener = db.collection('users').doc(userId)
            .collection('chats').doc(chatId)
            .collection('messages')
            .orderBy('timestamp')
            .onSnapshot(snapshot => {
                // Clear messages
                chatMessages.innerHTML = '';
                
                if (snapshot.empty) {
                    chatMessages.innerHTML = `
                        <div class="flex justify-center items-center h-full">
                            <p class="text-gray-500">No messages in this conversation yet.</p>
                        </div>
                    `;
                    return;
                }
                
                // Process messages
                const messages = [];
                snapshot.forEach(doc => {
                    const messageData = doc.data();
                    messages.push({
                        id: doc.id,
                        ...messageData
                    });
                });
                
                // Mark messages as read
                markMessagesAsRead(userId, chatId);
                
                // Render messages
                renderMessages(messages);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, error => {
                console.error('Error listening to messages:', error);
                showNotification(`Error loading messages: ${error.message}`, 'error');
            });
    }
    
    // Render messages in the chat
    function renderMessages(messages) {
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `mb-4 ${message.isFromUser ? 'text-right' : ''}`;
            
            const messageTime = message.timestamp?.seconds 
                ? new Date(message.timestamp.seconds * 1000) 
                : new Date();
            const formattedTime = formatTime(messageTime);
            
            messageElement.innerHTML = `
                <div class="${message.isFromUser 
                    ? 'inline-block bg-blue-100 text-blue-800 rounded-lg py-2 px-4 max-w-[80%]' 
                    : 'inline-block bg-gray-200 text-gray-800 rounded-lg py-2 px-4 max-w-[80%]'}">
                    <p class="text-sm">${message.content || message.text || 'No content'}</p>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    ${message.isFromUser ? 'Customer' : 'Support'} • ${formattedTime}
                </div>
            `;
            
            chatMessages.appendChild(messageElement);
        });
    }
    
    // Mark messages as read
    function markMessagesAsRead(userId, chatId) {
        // Get all unread messages
        db.collection('users').doc(userId)
            .collection('chats').doc(chatId)
            .collection('messages')
            .where('isFromUser', '==', true)
            .where('read', '==', false)
            .get()
            .then(snapshot => {
                if (snapshot.empty) return;
                
                // Create batch to update all messages
                const batch = db.batch();
                
                snapshot.forEach(doc => {
                    batch.update(doc.ref, { read: true });
                });
                
                // Reset unread count in chat document
                batch.update(
                    db.collection('users').doc(userId).collection('chats').doc(chatId),
                    { unreadCount: 0 }
                );
                
                // Commit batch
                return batch.commit();
            })
            .then(() => {
                // Update local data
                const chatIndex = allChats.findIndex(chat => 
                    chat.userId === userId && chat.chatId === chatId
                );
                
                if (chatIndex !== -1) {
                    allChats[chatIndex].unreadCount = 0;
                    renderChats();
                }
            })
            .catch(error => {
                console.error('Error marking messages as read:', error);
            });
    }
    
    // Send a new message
    function sendMessage() {
        if (!currentUserId || !currentChatId) {
            showNotification('No chat selected', 'error');
            return;
        }
        
        const messageText = messageInput.value.trim();
        
        if (!messageText) {
            showNotification('Message cannot be empty', 'error');
            return;
        }
        
        // Disable send button
        sendMessageBtn.disabled = true;
        
        // Create message object
        const message = {
            content: messageText,
            isFromUser: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: true,
            userId: currentUserId
        };
        
        // Add message to messages collection
        db.collection('users').doc(currentUserId)
            .collection('chats').doc(currentChatId)
            .collection('messages')
            .add(message)
            .then(() => {
                // Update chat metadata
                return db.collection('users').doc(currentUserId)
                    .collection('chats').doc(currentChatId)
                    .update({
                        lastMessage: messageText,
                        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
                    });
            })
            .then(() => {
                // Clear input
                messageInput.value = '';
                sendMessageBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error sending message:', error);
                showNotification(`Error sending message: ${error.message}`, 'error');
                sendMessageBtn.disabled = false;
            });
    }
    
    // Update chat status
    function updateChatStatus() {
        if (!currentUserId || !currentChatId) {
            showNotification('No chat selected', 'error');
            return;
        }
        
        const newStatus = chatStatusUpdate.value;
        
        // Disable button
        updateStatusBtn.disabled = true;
        
        // Update status in Firestore
        db.collection('users').doc(currentUserId)
            .collection('chats').doc(currentChatId)
            .update({
                status: newStatus
            })
            .then(() => {
                // Update local data
                const chatIndex = allChats.findIndex(chat => 
                    chat.userId === currentUserId && chat.chatId === currentChatId
                );
                
                if (chatIndex !== -1) {
                    allChats[chatIndex].status = newStatus;
                    renderChats();
                }
                
                // Update UI
                chatStatusBadge.textContent = newStatus;
                chatStatusBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(newStatus)}`;
                
                // Enable button
                updateStatusBtn.disabled = false;
                
                showNotification(`Chat status updated to ${newStatus}`, 'success');
            })
            .catch(error => {
                console.error('Error updating chat status:', error);
                showNotification(`Error updating status: ${error.message}`, 'error');
                updateStatusBtn.disabled = false;
            });
    }
    
    // Helper function to get status badge color
    function getStatusBadgeColor(status) {
        if (!status) return 'bg-gray-100 text-gray-800';
        
        switch(status.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
    
    // Format date helper
    function formatDate(date) {
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return formatTime(date);
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString(undefined, { weekday: 'long' });
        } else {
            return date.toLocaleDateString();
        }
    }
    
    // Format time helper
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Show notification
    function showNotification(message, type) {
        const notificationContainer = document.createElement('div');
        let bgColor = 'bg-green-500';
        
        if (type === 'error') {
            bgColor = 'bg-red-500';
        } else if (type === 'info') {
            bgColor = 'bg-blue-500';
        }
        
        notificationContainer.className = `fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded shadow-lg flex items-center`;
        
        notificationContainer.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                ${type === 'error' 
                    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
                    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
                }
            </svg>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notificationContainer);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notificationContainer.remove();
        }, 5000);
    }
    
    // Event listeners
    refreshBtn.addEventListener('click', loadChats);
    statusFilter.addEventListener('change', renderChats);
    sortBy.addEventListener('change', renderChats);
    sendMessageBtn.addEventListener('click', sendMessage);
    updateStatusBtn.addEventListener('click', updateChatStatus);
    
    // Enter key to send message
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Close chat button
    closeChatBtn.addEventListener('click', () => {
        if (messagesListener) {
            messagesListener();
            messagesListener = null;
        }
        
        chatConversation.classList.add('hidden');
        noChatSelected.classList.remove('hidden');
        currentUserId = null;
        currentChatId = null;
    });
    
    // Load chats on page load
    loadChats();
});
