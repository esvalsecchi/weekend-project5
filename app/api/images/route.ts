import { Request, Response, Router } from 'express';
import fetch from 'node-fetch';

const API_URL = "https://api-inference.huggingface.co/models/google/owlvit-base-patch32";
const API_KEY = "tu_token_api";  // Reemplaza con tu token de Hugging Face

const router = Router();

// Función para hacer la solicitud al modelo de Hugging Face
async function detectObjects(imageBase64: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: imageBase64
    })
  });

  const data = await response.json();
  return data;
}

// Endpoint para recibir la imagen del formulario
router.post('/detect-animal', async (req: Request, res: Response) => {
  try {
    // Asegúrate de que el formulario tenga el campo de archivo 'image'
    const imageFile = req.files?.image;

    if (!imageFile) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    // Convertir la imagen a Base64 (opcional, si usas archivos locales)
    const imageBase64 = imageFile.data.toString('base64');

    // Llamar al modelo de Hugging Face para la detección
    const detections = await detectObjects(imageBase64);

    // Enviar la respuesta con las detecciones
    res.json({
      message: 'Detección completada',
      detections: detections
    });
  } catch (error) {
    console.error("Error en la detección:", error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

export default router;
