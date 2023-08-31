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
    prompt: 
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
    let analyzedPrompt = body.analyzedPrompt;
    let missingBlocks = body.missingBlocks;
    
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

This is the user prompt, and current analysis:
${userPrompt}
${analyzedPrompt}
The user wants you to suggest improvements to these building blocks:
${missingBlocks}
Only those that are true should be suggested.
Suggest 3 improvements for each of these building blocks.
`
            ),
            HumanMessagePromptTemplate.fromTemplate(`Prompt: ${userPrompt}
Improvements: 
${missingBlocks.task ? 'Task' : ''}
${missingBlocks.persona ? 'Persona' : ''}
${missingBlocks.format ? 'Format' : ''}
${missingBlocks.tone ? 'Tone' : ''}
${missingBlocks.context ? 'Context' : ''}
${missingBlocks.exemplars ? 'Exemplars' : ''}`),
        ],
        inputVariables: ["inputText"],
    });

    const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY, modelName: "gpt-3.5-turbo-0613", temperature: 1.0, verbose: true });

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