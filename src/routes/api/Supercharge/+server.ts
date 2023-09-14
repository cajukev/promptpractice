// Uses a langsmith hub promt template to Supercharge the prompt

import type { RequestHandler } from "@sveltejs/kit";
import { ChatOpenAI } from "langchain/chat_models/openai";
import * as hub from "langchain/hub";

export const POST: RequestHandler = async ({request}) => {
    let form = await request.json();  
    let inputText = form.inputText;  
    let superchargegoal = form.superchargegoal;
    let prompt = await hub.pull("cajukev/prompt_practice_supercharge")
    const llm = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0,
        verbose: true,
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY
    })
    const chain = prompt.pipe(llm);
    let response = await chain.invoke({ goal:superchargegoal, prompt: inputText });

    return new Response( JSON.stringify(response.content));
};