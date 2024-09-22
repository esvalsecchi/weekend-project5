"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LoadingModal from "./loadingModal";

export function Detector() {
  // State variables to hold the uploaded image and other animal-related data
  const [image, setImage] = useState<File | null>(null); // For storing the uploaded image
  const [animalName, setAnimalName] = useState(""); // The name of the detected animal
  const [animalIcon, setAnimalIcon] = useState<JSX.Element | null>(null); // Animal icon (emoji)
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Preview image of the uploaded file
  const [animalDescription, setAnimalDescription] = useState<string | null>(null); // Animal description text
  const [isDangerous, setIsDangerous] = useState<string | null>(null); // Whether the animal is dangerous
  const [loading, setLoading] = useState(false); // Loading state during API calls
  const [animalDetected, setAnimalDetected] = useState(false); // Flag for enabling the second button when the animal is detected

  // Handle image upload and set the preview image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the uploaded file
    if (!file) return;
    setImage(file);

    const reader = new FileReader(); // Create a FileReader to read the file
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        setPreviewImage(reader.result); // Set the preview image once loaded
      }
    };
    reader.readAsDataURL(file); // Read the file as a data URL (for preview purposes)
  };

  // Convert the uploaded image to base64 format
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read the file as a base64 data URL
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]); // Return base64 part
        } else {
          reject("Error converting file");
        }
      };
      reader.onerror = (error) => reject(error); // Handle errors
    });
  };

  // Returns the animal icon based on the detected animal name
  const getAnimalIcon = (animal: string): JSX.Element | null => {
    switch (animal) {
      case "DOG":
        return <span>🐕</span>;
      case "CAT":
        return <span>🐈</span>;
      case "EAGLE":
        return <span>🦅</span>;
      case "HORSE":
        return <span>🐎</span>;
      case "COW":
        return <span>🐄</span>;
      case "SHARK":
        return <span>🦈</span>;
      case "LION":
        return <span>🦁</span>;
      case "WOLF":
        return <span>🐺</span>;
      case "WHALE":
        return <span>🐋</span>;
      case "MOUSE":
        return <span>🐁</span>;
      default:
        return null;
    }
  };

  // Handle animal detection process
  const handleAnimalDetection = async () => {
    setLoading(true); // Set loading state
    try {
      if (!image) throw new Error("No image available");

      const imageBase64 = await convertToBase64(image); // Convert the uploaded image to base64

      const candidateLabels = ["dog", "cat", "eagle", "horse", "cow", "shark", "lion", "wolf", "whale", "mouse"];

      // Call the backend API to detect the animal in the image
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          candidateLabels, // Send the list of possible animals to check
        }),
      });

      if (!response.ok) {
        throw new Error("Error detecting the animal");
      }

      const data = await response.json();
      const detectedAnimal = (data?.[0]?.score) > 0.6 ? data?.[0]?.label?.toUpperCase() : "ANIMAL NOT DETECTED"; // Check confidence score
      setAnimalName(detectedAnimal); // Set detected animal name
      setAnimalIcon(getAnimalIcon(detectedAnimal)); // Set animal icon

      setAnimalDetected(detectedAnimal !== "ANIMAL NOT DETECTED"); // Enable second button if an animal is detected
    } catch (error) {
      console.error("Error detecting animal:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle the animal description process and extract whether it's dangerous
  const handleAnimalDescription = async () => {
    setLoading(true);
    try {
      if (!animalName) throw new Error("No animal detected");

      const openaiResponse = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ detectedAnimal: animalName }),
      });

      if (!openaiResponse.ok) {
        throw new Error("Error checking if the animal is dangerous");
      }

      const { description } = await openaiResponse.json();

      // Extract the conclusion about danger between ** ** in the response
      const conclusionMatch = description.match(/\*\*(.*?)\*\*/);

      let isDangerous = ''; // Initialize isDangerous
      let cleanDescription = description; // Cleaned description

      if (conclusionMatch && conclusionMatch[1]) {
        isDangerous = conclusionMatch[1].trim(); // Extract the conclusion
        cleanDescription = description.replace(conclusionMatch[0], '').trim(); // Remove the conclusion from the description
      }

      // Update state with cleaned description and danger conclusion
      setAnimalDescription(cleanDescription);
      setIsDangerous(isDangerous);
    } catch (error) {
      console.error("Error getting animal description:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset the component to its initial state
  const handleReset = () => {
    setImage(null);
    setAnimalName("");
    setAnimalIcon(null);
    setPreviewImage(null);
    setAnimalDescription(null);
    setIsDangerous(null);
    setAnimalDetected(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-gray-50 rounded-lg shadow-lg">
      {/* Main container for the form and preview */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          {/* Title and instructions */}
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">AI Animal Detector</h1>
          <p className="text-gray-600 text-lg">
            Upload an image of an animal and we&apos;ll detect and classify it using AI. Animals supported: dog, cat, eagle, horse, cow, shark, lion, wolf, whale, and mouse.
          </p>
        </div>
        <Card className="rounded-lg shadow-lg">
          <CardContent className="grid gap-4 p-6 bg-white rounded-lg">
            {previewImage ? (
              // Show the uploaded image preview and animal details
              <div className="grid gap-2">
                <Image
                  src={previewImage}
                  alt="Uploaded Image"
                  width={400}
                  height={400}
                  className="rounded-md object-cover aspect-square shadow-md"
                />
                <div className="grid gap-1 mt-4">
                  <div className="flex items-center gap-2">
                    {animalIcon}
                    <h3 className="text-xl font-bold text-gray-800">{animalName}</h3>
                  </div>
                  {animalDescription && (
                    <p className="text-gray-700 text-base mt-2">
                      <strong>Description: </strong>{animalDescription}
                    </p>
                  )}
                 {isDangerous && (
                    <p className="text-lg font-semibold text-red-600 mt-2">
                      {isDangerous}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Show upload option if no image is uploaded
              <div className="grid gap-4 items-center justify-center p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 shadow-md">
                  <UploadIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-gray-600 text-center">
                  Drag and drop an image or click to upload
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center h-12 px-6 font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition-all duration-300"
                >
                  Upload Image
                </label>
              </div>
            )}
          </CardContent>
        </Card>
        {loading && <LoadingModal />}
        {/* Buttons for detecting animal, analyzing risk, and resetting the form */}
        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={handleAnimalDetection}
            disabled={!image}
            className="h-12 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Detect Animal
          </Button>
          <Button
            onClick={handleAnimalDescription}
            disabled={!animalDetected}
            className="h-12 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          >
            Analyze Risk
          </Button>
          <Button
            onClick={handleReset}
            className="h-12 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

// Icon for the upload input
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
