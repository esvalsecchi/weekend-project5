// app/api/cv/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
  try {
    // Extraemos el cuerpo de la solicitud
    const { imageBase64, candidateLabels } = await req.json();

    // Hacemos la petición a Hugging Face
    const response = await fetch("https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_KEY}`, // Reemplaza con tu clave de Hugging Face
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
        },
        parameters: {
          candidate_labels: candidateLabels,
        },
      }),
    });

    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      return NextResponse.json({ error: "Error in Hugging Face API request" }, { status: response.status });
    }

    // Devolvemos los datos obtenidos de Hugging Face
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error handling Hugging Face request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}