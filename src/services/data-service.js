const { db } = require('../config/firebase-admin-init');

class DataService {
  constructor(collection) {
    this.collection = db.collection(collection);
  }

  async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id, data) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  async delete(id) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    await docRef.delete();
    return { id };
  }

  async getAll(filters = {}, limit = 10) {
    let query = this.collection;

    if (filters.categoria) {
      query = query.where('categoria', '==', filters.categoria);
    }
    if (filters.createdBy) {
      query = query.where('createdBy', '==', filters.createdBy);
    }

    const snapshot = await query.limit(limit).get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }
}

module.exports = DataService;
