# LibgenUI

A browser-based AI tool that helps users build web applications in Angular without writing code, similar to bolt.new but specifically  designed for Angular development. This project combines Firebase for backend services and Google's Gemini AI for intelligent code generation capabilities. It allows developers to generate, preview, and render Angular components in real-time, making it easier to prototype and develop Angular applications.

The application serves as an interactive playground where you can:
- Generate Angular components and code using AI
- Instantly preview the rendered output
- Save and manage your code snippets
- Share and reuse components

![LibgenUI Interface](docs/assets/libgenui-interface.png)

## Features

- Code generation using Gemini AI
- Code snippet management and storage
- Real-time code preview
- Syntax highlighting
- Dynamic content generation
- File upload capabilities

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Project Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd libgenUI

# Install dependencies
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
   - Go to Firestore Database in the Firebase Console
   - Click "Create Database"
   - Choose production or test mode based on your needs
   - Select a location for your database

4. Get Firebase Configuration:
   - Go to Project Settings
   - Under "Your apps", click the web icon (</>)
   - Register your app with a nickname
   - Copy the Firebase configuration object

5. Configure Firebase in the application:
   - Navigate to `src/environments/environment.development.ts`
   - Update the Firebase configuration:

```typescript
export const environment = {
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  },
  // ... other configurations
};
```

### 3. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Configure the Gemini API key:
   - Navigate to `src/environments/environment.development.ts`
   - Add your Gemini API key:

```typescript
export const environment = {
  // ... Firebase config
  geminiApiKey: 'your-gemini-api-key'
};
```

## Running the Application

```bash
# Start the development server
ng serve

# Navigate to http://localhost:4200 in your browser
```

## Development Notes

- The application uses Angular Material for UI components
- Code snippets are stored in Firebase Firestore
- Real-time code preview is available for immediate feedback
- Syntax highlighting is implemented using a custom pipe

## Important Usage Notes

**When copying code examples:**
- Copy the code to a separate window/editor first
- Don't paste directly into the app as it may cause a refresh and data loss
- When implementing examples, ensure you copy all three files:
  - Component HTML (*.component.html)
  - Component TypeScript (*.component.ts)
  - Component Styles (*.component.scss)
- An exa

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



