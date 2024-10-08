# Weekend Project 5: Animal Classification and Danger Detection

# Project Description

This project uses an **OpenAI Agent** and Hugging Face to detect animals from an uploaded image and classify them as dangerous or not based on the animal's characteristics, retrieved from Wikipedia. The system leverages AI models to process images and text descriptions. The animals that can be detected include **dog, cat, eagle, horse, cow, shark, lion, wolf, whale, and mouse**. Sample images can be found inside the `public/images` directory.

## Features

- Upload an animal image and detect the type of animal using the Hugging Face API.
- Classify animals and assess if they are dangerous based on a description generated by an OpenAI Agent.
- Simple user interface with options to reset, detect, and analyze the risk of the detected animal.
- Detectable animals include: **dog, cat, eagle, horse, cow, shark, lion, wolf, whale, and mouse**.
- Sample images are available inside the `public/images` folder.

## Technologies Used

- **Next.js** - Framework for building the server-side API and handling requests.
- **OpenAI Agent** - Used for natural language processing and generating animal descriptions by interacting with Wikipedia-like knowledge.
- **Hugging Face** - Used for image classification and detecting the animal in the image.
- **TailwindCSS** - For styling the user interface and components.
- **TypeScript** - Ensures type safety across the project.

## How It Works

1. **Image Upload**: Users upload an image of an animal, which is converted to base64 and sent to the backend.
2. **Animal Detection**: The image is sent to Hugging Face's `clip-vit-base-patch32` model to detect the type of animal from a set of predefined labels (e.g., dog, cat, eagle).
3. **Animal Description**: Once an animal is detected, the name is passed to an **OpenAI Agent** to retrieve a description and determine whether the animal is dangerous or not.
4. **Danger Classification**: The conclusion about the danger level is extracted from OpenAI's response and displayed to the user.

## Installation

### Prerequisites

- **Node.js**: Ensure that you have Node.js installed on your machine.
- **API Keys**: You will need API keys for Hugging Face and OpenAI.

### Steps

1. Clone the repository:
   git clone https://github.com/esvalsecchi/weekend-project5.git
   cd weekend-project5.git


2. Install the required dependencies:
   npm install

3. Create an .env file in the root directory and add the following environment variables:
   OPENAI_API_KEY=your-openai-api-key
   HUGGING_FACE_KEY=your-huggingface-api-key

4. Run the development server:
   npm run dev

   <img width="560" alt="image" src="https://github.com/user-attachments/assets/ddba8b20-0270-4753-bc22-05cca1f88883">
   <img width="579" alt="image" src="https://github.com/user-attachments/assets/8b9eb6db-8c5d-4e76-a3ac-40d881fb0512">
   <img width="595" alt="image" src="https://github.com/user-attachments/assets/ae34556b-3af4-47d6-bf3e-fe7bc821eefc">


