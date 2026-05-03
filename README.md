# Pose Suggestion Web App

A web-based application that acts as your AI photography assistant. Point the camera, strike a pose, or let the AI suggest the perfect one for your environment! The app uses Google's Gemini Vision API (`gemini-2.5-flash-lite`) to analyze the current frame and recommend the best matching pose from a curated collection.

## Features
- **AI-Powered Pose Suggestion:** Analyzes the live camera feed and intelligently recommends a pose.
- **Pose Overlay:** Displays a silhouette of the suggested pose on your screen to help you mimic it perfectly.
- **Multi-Camera Support:** Switch between different available camera devices seamlessly.
- **Custom Gemini API Key:** Supply your own Gemini API key in the settings for unlimited use.
- **Capture Photo:** Take a photo when you're ready with the built-in shutter button.

## Important Notes & Limitations
- **No Selfie Poses (Yet):** Currently, the application is designed primarily for back-camera or full-body photography and **does not include poses suitable for selfies**.
- **Pose Library Size:** The app can suggest from a curated library of up to **47 unique poses** for now.

## How to Use
1. Allow camera permissions when prompted by your browser.
2. **(Optional)** Open the Settings (gear icon) to select a specific camera or input your custom Gemini API key.
3. Make sure the subject is visible in the frame.
4. Tap the **Suggest Pose** (magic wand) button. The AI will analyze the scene and pick the best pose.
5. A silhouette will appear on the screen. Mimic the pose!
6. Tap the shutter button at the bottom to capture and download your photo.

## Technologies Used
- React (Vite)
- Google Generative AI SDK (`@google/generative-ai`)
- Lucide React (Icons)
- Vanilla CSS

## Installation and Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` link in your browser.
