// Get Firestore instance
const db = firebase.firestore();

// Products operations
const productsCollection = db.collection('products');

async function addProduct(productData) {
    try {
        const docRef = await productsCollection.add({
            ...productData,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, error: error.message };
    }
}

async function getProducts() {
    try {
        const snapshot = await productsCollection.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting products:', error);
        return [];
    }
}

async function updateProduct(productId, productData) {
    try {
        await productsCollection.doc(productId).update({
            ...productData,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

async function deleteProduct(productId) {
    try {
        await productsCollection.doc(productId).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}
