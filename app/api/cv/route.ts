// app/api/cv/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
  try {
    // Extract the request body (expecting imageBase64 and candidateLabels)
    const { imageBase64, candidateLabels } = await req.json();

    // Make a request to Hugging Face's API with the provided image and labels
    const response = await fetch("https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_KEY}`, // Replace with your Hugging Face API key
        "Content-Type": "application/json", // Ensure the content type is JSON
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64, // Base64-encoded image sent in the request
        },
        parameters: {
          candidate_labels: candidateLabels, // List of possible labels for the model to classify
        },
      }),
    });

    // Check if the response from Hugging Face was successful
    if (!response.ok) {
      // Return an error response if the Hugging Face API call failed
      return NextResponse.json({ error: "Error in Hugging Face API request" }, { status: response.status });
    }

    // Parse and return the data obtained from Hugging Face's API
    const data = await response.json(); // Extract JSON from the response
    return NextResponse.json(data, { status: 200 }); // Send the data back to the client
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error handling Hugging Face request:", error);
    // Return a 500 Internal Server Error response if something went wrong
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
