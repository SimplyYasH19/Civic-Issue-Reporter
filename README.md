# Civic AI Issue Reporting Platform

AI-powered system to detect civic issues (potholes, garbage, waterlogging)
using image classification, auto-location, and real-time reporting.

Features
- Capture images of civic issues using a mobile phone
- AI-based image classification to detect the issue type
- Confidence score to verify prediction reliability
- Automatic GPS location capture
- User confirmation before submitting the report
- Issue data stored in Firebase Firestore

Architecture:
- AI & Backend: Python (FastAPI)
- Mobile App: React Native (Expo)
- Database: Firebase

Technologies Used
- Frontend: React Native (Expo)
- Backend: Python with FastAPI
- AI/ML: TensorFlow, Keras, TFLite
- Database: Firebase Firestore

How It Works
1. The user opens the app and captures an image of a civic issue
2. The image is sent to the backend for AI-based classification
3. The model returns the detected issue and confidence score
4. The user confirms the report after reviewing the details
5. The issue information is stored in the database

Dataset
The AI model was trained using an image dataset sourced from Kaggle, consisting of pothole and road surface images.

Future Improvements
- Extend the model to detect multiple civic issues such as garbage, waterlogging, and streetlight faults
- Add a map-based view to visualize reported issues
- Deploy the backend to the cloud for full-scale usage
- Improve model accuracy with a larger and more diverse dataset

Project Status
Academic Project / Prototype


