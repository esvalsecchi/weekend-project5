import OpenAI from "openai";

// Initialize OpenAI with the correct configuration
const openai = new OpenAI();

export async function POST(req: Request): Promise<Response> {
  try {
    // Extract the request body (expecting a JSON with detectedAnimal)
    const { detectedAnimal } = await req.json();

    if (!detectedAnimal) {
      return new Response("No animal detected in request body", { status: 400 });
    }

    // Create an assistant using GPT-4 and provide specific instructions
    const assistant = await openai.beta.assistants.create({
      name: "Zoologo", // The assistant's name
      instructions:
        "You will receive an animal name, search its description on Wikipedia, and determine if the animal is dangerous or not. At the end, indicate clearly if the animal is dangerous or not, and place this conclusion inside double asterisks like this: ** conclusion. **", // Specific instructions for the assistant
      model: "gpt-4o", // Specify the model
    });

    // Create a new thread to start a conversation
    const thread = await openai.beta.threads.create();

    // Send the detected animal name to the assistant as the user input
    await openai.beta.threads.messages.create(thread.id, {
      role: "user", // Indicate that this message is from the user
      content: `The animal is a ${detectedAnimal}`, // Send the detected animal as the message
    });

    // Execute the run and wait for the animal description from the assistant (non-streamed)
    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id, // Use the previously created assistant
    });

    // Check if the run was completed successfully
    if (run.status === 'completed') {
      // Get all the messages in the thread (conversation history)
      const messages = await openai.beta.threads.messages.list(run.thread_id);

      // Reverse the messages order and extract the assistant's response content
      const fullResponse = messages.data
        .reverse()
        .find((message) => message.role === 'assistant')?.content[0].text.value || ''; // Get the first assistant response

      // Return the assistant's full response in JSON format
      return new Response(
        JSON.stringify({
          description: fullResponse, // Send the description received from the assistant
        }),
        { status: 200, headers: { "Content-Type": "application/json" } } // Set the correct headers
      );

    } else {
      // If the first run did not complete successfully
      return new Response(`Run status (description): ${run.status}`, { status: 500 });
    }
  } catch (error) {
    // Log the error if any occurred during the process
    console.error("Error handling animal detection:", error);
    return new Response("Failed to process animal detection", { status: 500 });
  }
}
