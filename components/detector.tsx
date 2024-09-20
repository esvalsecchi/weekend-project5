"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Detector() {
  const [image, setImage] = useState<File | null>(null);
  const [animalName, setAnimalName] = useState("");
  const [animalIcon, setAnimalIcon] = useState<JSX.Element | null>(null); // Para almacenar el ícono correspondiente
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Manejar la carga de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);

    // Mostrar la vista previa de la imagen cargada
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Convertir la imagen a Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]); // Remueve el prefijo "data:image/png;base64,"
        } else {
          reject("Error converting file");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Función para obtener el ícono basado en el nombre del animal
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

  // Función para enviar la imagen al modelo de Hugging Face y detectar el animal
  const handleAnimalDetection = async () => {
    try {
      if (!image) throw new Error("No image available");

      // Convertir la imagen a base64
      const imageBase64 = await convertToBase64(image);

      // Lista de etiquetas posibles para Zero-Shot Classification
      const candidateLabels = ["dog", "cat", "eagle", "horse", "cow", "shark", "lion", "wolf", "whale", "mouse"];

      // Realizar la solicitud a la API de Hugging Face
      const response = await fetch("https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32", {
        method: "POST",
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Reemplaza con tu clave de Hugging Face
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            image: imageBase64, // La imagen en base64
          },
          parameters: {
            candidate_labels: candidateLabels, // Lista de etiquetas
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al detectar el animal");
      }

      const data = await response.json();

      // Procesar la detección del animal en la posición 0 y mostrar en mayúsculas
      const detectedAnimal = data?.[0]?.label?.toUpperCase() ?? "UNKNOWN";
      setAnimalName(detectedAnimal);

      // Obtener el ícono del animal
      const icon = getAnimalIcon(detectedAnimal);
      setAnimalIcon(icon);
    } catch (error) {
      console.error("Error detecting animal or checking danger:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Animal Detector</h1>
          <p className="text-muted-foreground">
            Upload an image of an animal and we'll detect and classify it.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4">
            {previewImage ? (
              <div className="grid gap-2">
                <img
                  src={previewImage}
                  alt="Uploaded Image"
                  width={400}
                  height={400}
                  className="rounded-md object-cover aspect-square"
                />
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    {animalIcon} {/* Mostrar el ícono del animal */}
                    <h3 className="text-lg font-semibold">{animalName}</h3>
                  </div>
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
        <Button
          onClick={handleAnimalDetection}
          disabled={!image}
          className="justify-self-start"
        >
          Detect Animal
        </Button>
      </div>
    </div>
  );
}

// Icon components remain the same (CheckIcon, DogIcon, TriangleAlertIcon, UploadIcon)



function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function DogIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
    </svg>
  )
}


function TriangleAlertIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
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
  )
}
