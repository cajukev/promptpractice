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
    prompt: z.object({
                task: z.array(z.string().describe("Task")),
                persona: z.array(z.string().describe("Persona")),
                tone: z.array(z.string().describe("Tone")),
                format: z.array(z.string().describe("Format")),
                exemplars: z.array(z.string().describe("Exemplars")),
                context: z.array(z.string().describe("Context")),
            })
        .describe("The 6 building blocks of the prompt"),
});


export const POST: RequestHandler = async ({ request }) => {
    let body = await request.json();

    
    const prompt = new ChatPromptTemplate({
        promptMessages: [
            SystemMessagePromptTemplate.fromTemplate(
                `Separate the users text in terms of the 6 building blocks
Task: The main action you want to be executed. Includes verb or action word. ex: write an x, summarize this y. Single or multiple
Persona: The character you want the model to assume. ex: anime villain, 5 year old. Single or multiple
Format: The type of text / presentation / medium of the user's desired output. Often substring of task. ex: email, monologue, report, article, use tables. Single or multiple
Tone: The tone or mood in which the response should be delivered. ex: 'use a formal and friendly tone', 'use suggestive language' Single or multiple
Exemplars: Specific elements the user wants to include. Can include verbs. Single or multiple
Context: Informational Context about the task - often substring of task in shorter prompts. Single or multiple

Must be exact quotes from the user prompt
Blocks can appear in any order
Return each block as an array of phrases 
If there are many correct answers and they are not in the same phrase, return multiple quotes
Only return exact quotes that are part of the original user prompt as-is despite errors or not making sense as a standalone phrase
There may be overlap between blocks 
If the building block is missing, return an empty string. 
Every part of the prompt should be returned in one of the 6 building blocks.

E:
''You, as senior product marketing manager at Apple have just unveiled the latest Apple product in collaboration with Tesla, the Apple car, and received 12,000 pre-orders which is 200% higher than target. Write an email to your boss, Tim Cook, sharing this positive news. The email should include a TLDR (too long; didn't read) section and end with a section thanking the product and engineering teams. Use clear and concise language and write in a confident yet friendly tone. The email should have at least 2 tables and 5 bullet points. Return only valid markdown.
Task - Write an email to your boss
Persona - as senior product marketing manager at Apple
Format - [email, Return only valid markdown] // (as an array of strings)
Tone - Use clear and concise language and write in a confident yet friendly tone
Exemplars - [sharing this positive news, The email should include a TLDR (too long; didn't read) section and end with a section thanking the product and engineering teams]
Context - ['Tim Cook', 'have just unveiled the latest Apple product in collaboration with Tesla, the Apple car, and received 12,000 pre-orders which is 200% higher than target'] ''

`
            ),
            HumanMessagePromptTemplate.fromTemplate("User prompt: (only copy as-is) {inputText}"),
        ],
        inputVariables: ["inputText"],
    });

    const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY, modelName: "gpt-3.5-turbo-0613", temperature: 0, verbose: true });

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
        inputText: body.prompt,
    });

    console.log(JSON.stringify(response));

    return new Response( 
        JSON.stringify(response),
    );
};