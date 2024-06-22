import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore'; // Change the import statement

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}
  addData(collectionName: string, documentName: string, data: { [key: string]: any }) {
    const itemsCollection = doc(this.firestore, collectionName, documentName);
    updateDoc(itemsCollection, {
      ...data
    });
    return ;
  }
}
