"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import LoadingModal from "./loadingModal";

export function Detector() {
  const [image, setImage] = useState<File | null>(null);
  const [animalName, setAnimalName] = useState("");
  const [animalIcon, setAnimalIcon] = useState<JSX.Element | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [animalDescription, setAnimalDescription] = useState<string | null>(null);
  const [isDangerous, setIsDangerous] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [animalDetected, setAnimalDetected] = useState(false); // Estado para habilitar el segundo botón

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]);
        } else {
          reject("Error converting file");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

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

  const handleAnimalDetection = async () => {
    setLoading(true);
    try {
      if (!image) throw new Error("No image available");

      const imageBase64 = await convertToBase64(image);

      const candidateLabels = ["dog", "cat", "eagle", "horse", "cow", "shark", "lion", "wolf", "whale", "mouse"];

      const response = await fetch("/api/cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          candidateLabels,
        }),
      });

      if (!response.ok) {
        throw new Error("Error detecting the animal");
      }

      const data = await response.json();
      const detectedAnimal = (data?.[0]?.score) > 0.6 ? data?.[0]?.label?.toUpperCase() : "ANIMAL NOT DETECTED";
      setAnimalName(detectedAnimal);
      setAnimalIcon(getAnimalIcon(detectedAnimal));

      // Habilitamos el botón de 'Generate Description' si el animal fue detectado correctamente
      setAnimalDetected(detectedAnimal !== "ANIMAL NOT DETECTED");
    } catch (error) {
      console.error("Error detecting animal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalDescription = async () => {
    setLoading(true);
    try {
      if (!animalName) throw new Error("No animal detected");

      const openaiResponse = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ detectedAnimal: animalName }),
      });

      if (!openaiResponse.ok) {
        throw new Error("Error checking if the animal is dangerous");
      }

      const { description, isDangerous } = await openaiResponse.json();

      setAnimalDescription(description);
      setIsDangerous(isDangerous);
    } catch (error) {
      console.error("Error getting animal description:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Restablecer todos los estados a sus valores originales
    setImage(null);
    setAnimalName("");
    setAnimalIcon(null);
    setPreviewImage(null);
    setAnimalDescription(null);
    setIsDangerous(null);
    setAnimalDetected(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Animal Detector</h1>
          <p className="text-muted-foreground">
            Upload an image of an animal and we&apos;ll detect and classify it. The animals accepted are: dog, cat, eagle, horse, cow, shark, lion, wolf, whale, and mouse.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4">
            {previewImage ? (
              <div className="grid gap-2">
                <Image
                  src={previewImage}
                  alt="Uploaded Image"
                  width={400}
                  height={400}
                  className="rounded-md object-cover aspect-square"
                />
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    {animalIcon}
                    <h3 className="text-lg font-semibold">{animalName}</h3>
                  </div>
                  {animalDescription && (
                    <p className="text-muted-foreground">
                      <strong>Description: </strong>{animalDescription}
                    </p>
                  )}
                  {isDangerous !== null && (
                    <p className={`text-lg font-semibold ${isDangerous ? 'text-red-500' : 'text-green-500'}`}>
                      {isDangerous ? "This animal is dangerous!" : "This animal is not dangerous."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 items-center justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <UploadIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
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
                  className="inline-flex items-center justify-center h-10 px-4 font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Upload Image
                </label>
              </div>
            )}
          </CardContent>
        </Card>
        {loading && <LoadingModal />}
        <Button
          onClick={handleAnimalDetection}
          disabled={!image}
          className="justify-self-start"
        >
          Detect Animal
        </Button>
        <Button
          onClick={handleAnimalDescription}
          disabled={!animalDetected}
          className="justify-self-start"
        >
          Generate Description
        </Button>
        <Button
          onClick={handleReset}
          className="justify-self-start bg-red-500 text-white hover:bg-red-600"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

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