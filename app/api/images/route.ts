import OpenAI from "openai";

// Inicializamos OpenAI con el tipo correcto
const openai = new OpenAI();

export async function POST(req: Request): Promise<Response> {
  try {
    // Extraemos el cuerpo de la petición (esperamos un JSON con detectedAnimal)
    const { detectedAnimal } = await req.json();

    if (!detectedAnimal) {
      return new Response("No animal detected in request body", { status: 400 });
    }

    // Creamos un asistente utilizando el modelo GPT-4 y le damos instrucciones
    const assistant = await openai.beta.assistants.create({
      name: "Zoologo",
      instructions:
        "You will receive an animal name, search its description on Wikipedia, and determine if the animal is dangerous or not.",
      model: "gpt-4o"
    });

    // Creamos un nuevo hilo (thread)
    const thread = await openai.beta.threads.create();

    // Enviamos un mensaje con el nombre del animal detectado
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `The animal is a ${detectedAnimal}`
    });

    // Ejecutamos el run y esperamos a que termine (sin stream)
    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    // Si la ejecución fue completada
    if (run.status === 'completed') {
      // Obtenemos los mensajes del thread
      const messages = await openai.beta.threads.messages.list(run.thread_id);

      // Invertimos el orden de los mensajes y extraemos el contenido del asistente
      const fullResponse = messages.data
        .reverse()
        .find((message) => message.role === 'assistant')?.content[0].text.value || '';

      // Determinamos si el animal es peligroso a partir del contenido
      const isDangerous = /dangerous|aggressive/i.test(fullResponse);

      // Retornamos la descripción y si el animal es peligroso
      return new Response(
        JSON.stringify({
          description: fullResponse,
          isDangerous,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Si el run no fue completado correctamente
      return new Response(`Run status: ${run.status}`, { status: 500 });
    }
  } catch (error) {
    console.error("Error handling animal detection:", error);
    return new Response("Failed to process animal detection", { status: 500 });
  }
}