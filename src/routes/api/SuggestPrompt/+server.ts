import type { RequestHandler } from "@sveltejs/kit";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from "langchain/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

const zodSchema = z.object({
    elements: 
            z.object({
                task: z.array(z.string().describe("Task. Empty array or suggestion")),
                persona: z.array(z.string().describe("Persona. Empty array or suggestion")),
                format: z.array(z.string().describe("Format. Empty array or suggestion")),
                tone: z.array(z.string().describe("Tone. Empty array or suggestion")),
                exemplars: z.array(z.string().describe("Exemplars. Empty array or suggestion")),
                context: z.array(z.string().describe("Context. Empty array or suggestion")),
            })
        .describe("The 6 building blocks of the prompt"),
});


export const POST: RequestHandler = async ({ request }) => {
    let body = await request.json();

    let userPrompt = body.prompt;

    let analysisString = "";
    Object.keys(body.analyzedPrompt).forEach((analysis) => {
        if ((body.analyzedPrompt as Record<string, any>)[analysis].length > 0) {
            analysisString += `${analysis}: `;
            analysisString += (body.analyzedPrompt as Record<string, any>)[analysis].join(", ");
            analysisString += "\n";
        }
    });

    let missingBlocksString = "";
    Object.keys(body.missingBlocks).forEach((block) => {
        if ((body.missingBlocks as Record<string, any>)[block]) {
            missingBlocksString += `${block}\n`;
        }
    });
    
    const prompt = new ChatPromptTemplate({
        promptMessages: [
            SystemMessagePromptTemplate.fromTemplate(
                `{inputText}Here are the 6 building blocks of a good prompt:
Task: The main action you want to be executed. Includes verb or action word. ex: write, summarize. Single or multiple
Persona: The voice or character you want the model to assume. ex: anime villain, 5 year old. Single or multiple
Format: The visual layout or presentation or medium of the desired output. ex: email, monologue, report, article, use tables. Single or multiple
Tone: The tone or mood in which the response should be delivered. ex: 'use a formal and friendly tone'. Single or multiple
Exemplars: Examples or elements or verbs to guide the response. ex: 'Use these words...', 'Include this ...' Single or multiple
Context: Information - ex: about a topic. Single or multiple

Suggest 3 examples for each of these missing building block.

E:
Prompt: Compose a celebratory toast for a wedding, blending joy and sentimentality to capture the essence of the couple's relationship.
Suggest: 
Persona
Context

Persona: [As a soldier writing home, As a senior product marketing manager at Apple, As the king of the jungle]
Context: [The groom is your best friend, The bride is your sister, The couple is your parents]
others are empty arrays
`
            ),
            HumanMessagePromptTemplate.fromTemplate(`Prompt: ${userPrompt}
Suggest: 
${missingBlocksString}`),
        ],
        inputVariables: ["inputText"],
    });

    const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY, modelName: "gpt-3.5-turbo-0613", temperature: 0.5, verbose: true });

    // Binding "function_call" below makes the model always call the specified function.
    // If you want to allow the model to call functions selectively, omit it.
    const functionCallingModel = llm.bind({
        functions: [
            {
                name: "output_formatter",
                description: "Should always be used to properly format output",
                parameters: zodToJsonSchema(zodSchema),
            },
        ],
        function_call: { name: "output_formatter" },
    });

    const outputParser = new JsonOutputFunctionsParser();

    const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

    const response = await chain.invoke({
        inputText: '',
    });

    console.log(JSON.stringify(response));

    return new Response( 
        JSON.stringify(response),
    );
};