import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public itemsCollection: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject({});

  constructor(private firestore: Firestore) {}

  async saveData(collectionName: string, documentName: string, data: { [key: string]: any }): Promise<void> {
    try {
      const itemsCollection = doc(this.firestore, collectionName, documentName);
      await updateDoc(itemsCollection, data);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  getData(collectionName: string, documentName: string): Observable<any> {
    const itemDoc = doc(this.firestore, collectionName, documentName);
    return from(getDoc(itemDoc)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data();
          this.itemsCollection.next(data);
          return data;
        } else {
          console.log('No such document!');
          return null;
        }
      }),
      catchError(error => {
        console.error('Error getting document:', error);
        throw error;
      })
    );
  }
}
