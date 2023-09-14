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
import { Client } from "langsmith";
import { LangChainTracer } from "langchain/callbacks";

const client = new Client({
    apiUrl: "https://api.smith.langchain.com",
    apiKey: "ls__c6e70a8660ef488998362db5aab8b8a6"
  });

  const tracer = new LangChainTracer({
    client
  });


const zodSchema = z.object({
        task: z.array(z.string().describe("Task: The main action you want to be executed. Includes verb or action word. ex: write an x, summarize this y.")).optional(),
        format: z.array(z.string().describe("Format: The type of text / presentation / medium of the user's desired output. Often substring of task. ex: email, monologue, report, article, use tables.")).optional(),
        context: z.array(z.string().describe("Context: Informational Context about the task - often substring of task in shorter prompts.")).optional(),
        tone: z.array(z.string().describe("Tone: The tone or mood in which the response should be delivered. ex: 'use a formal and friendly tone', 'use suggestive language'")).optional(),
        exemplars: z.array(z.string().describe("Exemplars: Specific elements the user wants to include. Can include verbs.")).optional(),
        persona: z.array(z.string().describe("Persona: The character you want the model to assume. ex: anime villain, 5 year old.")).optional(),
    })
    .describe("The 6 building blocks of the prompt")


export const POST: RequestHandler = async ({ request }) => {
    let body = await request.json();

    
    const prompt = new ChatPromptTemplate({
        promptMessages: [
            SystemMessagePromptTemplate.fromTemplate(
                `Separate the users text in terms of the 6 building blocks
Use as many building blocks as you can as long as you only quote the user - else return nothing.
Example:
''You, as senior product marketing manager at Apple have just unveiled the latest Apple product in collaboration with Tesla, the Apple car, and received 12,000 pre-orders which is 200% higher than target. Write an email to your boss, Tim Cook, sharing this positive news. The email should include a TLDR (too long; didn't read) section and end with a section thanking the product and engineering teams. Use clear and concise language and write in a confident yet friendly tone. The email should have at least 2 tables and 5 bullet points. Return only valid markdown.
Task - [Write an email to your boss]
Persona - [as senior product marketing manager at Apple]
Format - [email, Return only valid markdown] // (as an array of strings)
Tone - [Use clear and concise language and write in a confident yet friendly tone]
Exemplars - [sharing this positive news, The email should include a TLDR (too long; didn't read) section and end with a section thanking the product and engineering teams]
Context - ['Tim Cook', 'have just unveiled the latest Apple product in collaboration with Tesla, the Apple car, and received 12,000 pre-orders which is 200% higher than target'] ''

Example 2:
''Write a funny poem about a bald tiger.
Task - [Write a funny poem]
Format - [poem]
Context - [about a bald tiger]''
`
            ),
            HumanMessagePromptTemplate.fromTemplate("{inputText}"),
            SystemMessagePromptTemplate.fromTemplate("(Remember only write words the user wrote)"),
        ],
        inputVariables: ["inputText"],
    });

    const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY, modelName: "gpt-3.5-turbo-0613", temperature: 0, verbose: true, callbacks: [tracer] });

    // Binding "function_call" below makes the model always call the specified function.
    // If you want to allow the model to call functions selectively, omit it.
    const functionCallingModel = llm.bind({
        functions: [
            {
                name: "fx",
                description: "",
                parameters: zodToJsonSchema(zodSchema),
            },
        ],
        function_call: { name: "fx" },
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
