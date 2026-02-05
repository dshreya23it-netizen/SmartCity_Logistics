// server/services/firebaseSync.js
const admin = require('firebase-admin');
const Product = require('../models/Product');

class FirebaseSync {
  constructor() {
    this.db = admin.firestore();
  }

  // Sync product to Firestore
  async syncProduct(product) {
    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        image: product.image,
        location: product.location,
        status: product.status,
        specifications: product.specifications,
        mongoId: product._id.toString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: product.createdAt ? 
          admin.firestore.Timestamp.fromDate(product.createdAt) : 
          admin.firestore.FieldValue.serverTimestamp()
      };

      // Check if document exists
      const docRef = this.db.collection('products').doc(product._id.toString());
      const doc = await docRef.get();

      if (doc.exists) {
        await docRef.update(productData);
        console.log(`✅ Updated product ${product._id} in Firestore`);
      } else {
        await docRef.set(productData);
        console.log(`✅ Created product ${product._id} in Firestore`);
      }
    } catch (error) {
      console.error('❌ Error syncing product to Firestore:', error);
    }
  }

  // Delete product from Firestore
  async deleteProduct(productId) {
    try {
      await this.db.collection('products').doc(productId).delete();
      console.log(`✅ Deleted product ${productId} from Firestore`);
    } catch (error) {
      console.error('❌ Error deleting product from Firestore:', error);
    }
  }

  // Sync all products (for initial setup)
  async syncAllProducts() {
    try {
      const products = await Product.find({});
      
      console.log(`Syncing ${products.length} products to Firestore...`);
      
      const batch = this.db.batch();
      const productsRef = this.db.collection('products');
      
      products.forEach(product => {
        const productData = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image: product.image,
          location: product.location,
          status: product.status,
          specifications: product.specifications,
          mongoId: product._id.toString(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: product.createdAt ? 
            admin.firestore.Timestamp.fromDate(product.createdAt) : 
            admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = productsRef.doc(product._id.toString());
        batch.set(docRef, productData);
      });
      
      await batch.commit();
      console.log('✅ All products synced to Firestore');
    } catch (error) {
      console.error('❌ Error syncing all products:', error);
    }
  }
}

module.exports = new FirebaseSync();