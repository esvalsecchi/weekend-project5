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
      model: "gpt-4",
    });

    // Creamos un nuevo hilo (thread)
    const thread = await openai.beta.threads.create();

    // Enviamos un mensaje con el nombre del animal detectado
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `The animal is a ${detectedAnimal}`,
    });

    // Ejecutamos el run y esperamos la descripción del animal (sin stream)
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

      // Realizamos una segunda consulta para preguntar si el animal es peligroso y que nos devuelva una descripción
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Based on your previous description, is the ${detectedAnimal} dangerous? Give a detailed explanation.`,
      });

      // Ejecutamos otro run para esta segunda consulta
      run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
      });

      // Si la ejecución de la segunda consulta fue completada
      if (run.status === 'completed') {
        // Obtenemos los nuevos mensajes del thread
        const newMessages = await openai.beta.threads.messages.list(run.thread_id);

        // Extraemos la respuesta sobre si el animal es peligroso
        const dangerResponse = newMessages.data
          .reverse()
          .find((message) => message.role === 'assistant')?.content[0].text.value || '';

        // Extraemos un porcentaje estimado basado en palabras clave de la descripción
        let dangerPercentage = 0;
        
        // Verificamos ciertas palabras clave en la respuesta y asignamos un valor de peligrosidad
        if (/very dangerous|highly aggressive/i.test(dangerResponse)) {
          dangerPercentage = 90; // Muy peligroso
        } else if (/dangerous|aggressive|threat|attack|bite/i.test(dangerResponse)) {
          dangerPercentage = 70; // Bastante peligroso
        } else if (/can be dangerous|potentially dangerous/i.test(dangerResponse)) {
          dangerPercentage = 50; // Peligrosidad media
        } else if (/rarely dangerous|not typically dangerous/i.test(dangerResponse)) {
          dangerPercentage = 30; // Peligrosidad baja
        } else {
          dangerPercentage = 10; // No peligroso
        }

        // Si el porcentaje de peligrosidad es mayor a 50, consideramos que el animal es peligroso
        const isDangerous = dangerPercentage > 50;

        // Retornamos la descripción y si el animal es peligroso junto con el porcentaje
        return new Response(
          JSON.stringify({
            description: fullResponse,
            isDangerous,
            dangerPercentage,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else {
        // Si la segunda ejecución no fue completada correctamente
        return new Response(`Run status (danger check): ${run.status}`, { status: 500 });
      }
    } else {
      // Si el primer run no fue completado correctamente
      return new Response(`Run status (description): ${run.status}`, { status: 500 });
    }
  } catch (error) {
    console.error("Error handling animal detection:", error);
    return new Response("Failed to process animal detection", { status: 500 });
  }
}