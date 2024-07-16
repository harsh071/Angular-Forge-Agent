import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc, getDoc } from '@angular/fire/firestore'; // Change the import statement
import { BehaviorSubject, Observable, isEmpty } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public itemsCollection: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject({});
  constructor(private firestore: Firestore) {}
  addData(collectionName: string, documentName: string, data: { [key: string]: any }) {
    const itemsCollection = doc(this.firestore, collectionName, documentName);
    updateDoc(itemsCollection, {
      ...data
    });
    return ;
  }

  getData(collectionName: string, documentName: string): any {
    const itemDoc = doc(this.firestore, collectionName, documentName);
    getDoc(itemDoc).then((doc) => {
      if (doc.exists()) {
        this.itemsCollection.next(doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
      }
    }
    ).catch((error) => {
      console.log('Error getting document:', error);
    });
  }
}
