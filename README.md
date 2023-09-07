# Prompt Engineering App - 6 Building Blocks

### https://promptpractice.vercel.app/

Inspired by [this video from Jeff Su](https://www.youtube.com/embed/jC4v5AS4RIM?si=Vd9pLM6Jd_iy7jma) where he goes over the concept of "building blocks" for prompts.
I wanted a tool to play around with this concept by analyzing prompts and suggesting improvements.
### Features
- Accepts a user-entered text prompt as input
- Analyzes the prompt and separates it into its 6 core components or "building blocks"
- Identifies any missing or weak blocks within the prompt structure
- Provides tailored suggestions to fill in missing blocks
- Allows the user to select improvements to incorporate into a revised prompt
- Generates an edited prompt based on the selected changes
### Usage
- Enter a text prompt
- Click "Analyze" to break it down into building blocks
- The app will identify any missing blocks
- Click "Suggest" to get improvement options
- Select suggestions to add to the prompt
- Click "Revise" to generate an updated prompt
- Improvements can be further refined through multiple iterations
### Tech Stack
- Skeleton UI Framework (Svelte + SvelteKit + TailwindCSS)
- Langchain & OpenAI APIs - Function Calling
- Vercel Deployment
### Roadmap
- Fine-tune 3.5 models to generate more creative suggestions & more exact analyses.
- Extrapolate logic to other ways of thinking about prompt structure.