# Weekend Project

To consolidate the knowledge acquired this week, students should complete the following project:

## Project Description

This project involves creating a web application using Next.js that allows users to upload an image of an animal and use a computer vision model to detect and classify the animal. Additionally, an AI agent will be used to search Wikipedia for information about the detected animal and determine if it is dangerous.

## Instructions

1. Create a GitHub repository for your project.
2. Add all members of your group as collaborators.
3. Create a `README.md` file with the description of your project.
4. Create a new application from scratch using Next.js.
5. Create a page with a single input field for the user to upload an image.
   - Ideally, the user would upload a picture of an animal.
6. Add a button to upload the image.
7. Use a computer vision model to detect and classify the animal.
   - The model should be able to detect at least 10 different animals of your choice.
   - The model should return the name of the animal detected (classification).
8. Create an AI agent that can find a page in Wikipedia with the name of the animal, retrieve the description, and determine if the animal is dangerous.
   - If the uploaded image contains an animal, pass the image to the AI agent and await the answer.
9. Display the answer on the page, indicating whether the animal in the picture is dangerous.

## Getting Started

First, run the development server:

```bash
npm i
npm run dev
```