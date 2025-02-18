import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SSEService {
  private eventSource: EventSource;

  constructor(private ngZone: NgZone) {}

  connect(): Observable<any> {
    return new Observable(subscriber => {
      this.eventSource = new EventSource('http://localhost:3000/events');

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          subscriber.next(JSON.parse(event.data));
        });
      };

      this.eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          subscriber.error(error);
        });
      };

      return () => {
        this.eventSource.close();
      };
    });
  }

  // Method to trigger events (for testing)
  async triggerEvent(data: any): Promise<void> {

    console.log('Triggering event:', data);    
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(data),
      // Add additional fetch options if needed
      credentials: 'include', // Handles cookies if required
      mode: 'cors', // Explicitly state CORS mode
      cache: 'no-cache', // Prevent caching of POST requests
    });

    const responseData = await response.json();
    console.log('Event triggered successfully');
    console.log('Response:', responseData);
  }
}