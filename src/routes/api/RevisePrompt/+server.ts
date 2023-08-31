import type { RequestHandler } from "@sveltejs/kit";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain";
import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from "langchain/prompts";

export const POST: RequestHandler = async ({ request }) => {
    let body = await request.json();
    let suggestions: Suggestions = body.suggestions;
    let improvements: Suggestions = body.improvements;

    // Create a string that represents the suggestions, only keep those that are checked
    let suggestionsString = "";
    Object.keys(suggestions).forEach((suggestion) => {
        if ((suggestions as Record<string, any>)[suggestion].filter((s: { checked: boolean; }) => s.checked).length > 0) {
            suggestionsString += `${suggestion}: `;
            suggestionsString += (suggestions as Record<string, any>)[suggestion]
                .filter((s: { checked: boolean; }) => s.checked)
                .map((s: { name: string; }) => s.name)
                .join(", ");
            suggestionsString += "\n";
        }
    });

    // Create a string that represents the improvements, only keep those that are checked
    let improvementsString = "";
    Object.keys(improvements).forEach((improvement) => {
        if ((improvements as Record<string, any>)[improvement].filter((s: { checked: boolean; }) => s.checked).length > 0) {
            improvementsString += `${improvement}: `;
            improvementsString += (improvements as Record<string, any>)[improvement]
                .filter((s: { checked: boolean; }) => s.checked)
                .map((s: { name: string; }) => s.name)
                .join(", ");
            improvementsString += "\n";
        }
    });
    
    const prompt = new ChatPromptTemplate({
        promptMessages: [
            SystemMessagePromptTemplate.fromTemplate(
                `Revise the user's prompt using their original prompt and all the suggestions.
Use the 6 building blocks theory.
Task: The main action you want to be executed. Includes verb or action word. ex: write an x, summarize this y. Single or multiple
Persona: The voice or character you want the model to assume. ex: anime villain, 5 year old. Single or multiple
Format: The visual layout or presentation or medium of the desired output. ex: email, monologue, report, article, use tables. Single or multiple
Tone: The tone or mood in which the response should be delivered. ex: 'use a formal and friendly tone', 'use suggestive language' Single or multiple
Exemplars: Specific elements the user wants to include. Overview of contents.  Single or multiple
Context: Informational Context about the task - often substring of task. Single or multiple
Return only a new prompt that will then be used as an input.`
            ),
            HumanMessagePromptTemplate.fromTemplate(`{inputText}
Original Prompt: ${body.prompt}
Analysis: ${body.analyzedPrompt}
Suggestions: ${suggestionsString}
Improvements: ${improvementsString}
Revised Prompt:`),
        ],
        inputVariables: ["inputText"],
    });

    const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY, modelName: "gpt-3.5-turbo-0613", temperature: 0, verbose: true });

    const chain = new LLMChain({
        prompt,
        llm,
    });

    const response = await chain.call({
        inputText: '',
    });

    console.log(JSON.stringify(response));

    return new Response( 
        JSON.stringify(response),
    );
};