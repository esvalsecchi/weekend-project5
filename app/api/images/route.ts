import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Deshabilitar el bodyParser para que formidable pueda manejar la solicitud multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para convertir la imagen a Base64
const convertImageToBase64 = (filePath: string): string => {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString('base64');
};

// Función para hacer la solicitud al modelo de detección de objetos
async function detectObjects(imageBase64: string) {
  const API_URL = process.env.API_URL!;
  const API_KEY = process.env.API_KEY!;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: imageBase64,
    }),
  });

  const data = await response.json();
  return data;
}

// API handler para manejar la solicitud POST
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error al subir la imagen:', err);
        return res.status(500).json({ error: 'Error al procesar la imagen' });
      }

      // Obtener el archivo de imagen
      const imageFile = files.image;

      if (!imageFile || Array.isArray(imageFile)) {
        return res.status(400).json({ error: 'No se recibió ninguna imagen o hay múltiples imágenes' });
      }

      // Convertir la imagen a Base64
      const filePath = imageFile.filepath;
      const imageBase64 = convertImageToBase64(filePath);

      try {
        // Llamar a la función de detección de objetos
        const detections = await detectObjects(imageBase64);

        // Enviar la respuesta con las detecciones
        return res.status(200).json(detections);
      } catch (error) {
        console.error('Error en la detección:', error);
        return res.status(500).json({ error: 'Error en la detección de objetos' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}
