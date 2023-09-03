<!-- 

    Inpsired by Jeff Su - Master the Perfect ChatGPT Prompt Formula (in just 8 minutes)!
    https://www.youtube.com/watch?v=jC4v5AS4RIM
    
    Where Jeff talks about the 6 key components that make up the perfect formula for chatting with LLMs.

    I wanted a tool that would allow me to quickly iterate on these 6 components.
    2 paths: ChatGPT Custom Instructions, and Web Interface

    Custom Instructions:

    What would you like ChatGPT to know about you to provide better responses?
    ```dropdown
    Six Building Blocks of a Good Prompt:
    a. Task: The main action you want to be executed.  Begin with an action verb. Specify the end goal. Can be simple or complex.
    b. Context: Background or conditions to guide the task. Provides guidance. Ask these questions:
    - User’s background?
    - What does success look like?
    - What environment are they in?
    c. Exemplars: Examples or structures to guide the response. Including examples within prompts improves output quality.
    d. Persona: The identity or expertise you want the model to assume. Think of an expert you’d want advice from. Can even use fictional characters.
    e. Format: The visual layout or presentation of the desired output.  Visualize the end result. Common formats: emails, tables, bullet points, code blocks, and paragraphs in markdown.
    f. Tone: The voice or mood in which the response should be delivered. Specify the mood of the response. Pro tip: Describe the feeling you’re going for.

    Order of Importance:
    Mandatory: Task
    Important: Context and Exemplars
    Nice to have: Persona, Format, and Tone

    Example:
    Construct an email as a senior product marketing manager at Apple who collaborated with Tesla on a new product.
    Achieved 12,000 pre-orders, 200% above target.
    The email should have sections: a TLDR, project background, business results, and a thank you.
    The language should be clear, concise, and convey a confident yet friendly tone.
    ```

    How would you like ChatGPT to respond?
    ```dropdown
    Wait for the user to input what they want as a prompt.
    The User will use a * to indicate that they want to expand the prompt
    so, guide them through the prompt creation by asking a series of clarifying questions without formatting. In the end, execute prompt that is to the user's liking.
    Else, simply answer the question as if none of the Custom Instructions were written at all.
    ```


    Web Interface:
    With the web interface I was able to create a system for iterating and improving a prompt by analysing an initial prompt and letting the user chose how to improve it.
    Flow:
    - Enter a text prompt
    - Click "Analyze" to break it down into building blocks
    - Click "Suggest" or "Improve" to generate suggestions / improvements for each building block
    - Select suggestions to add to the prompt
    - Click "Revise" to generate an updated prompt
    - Improvements can be further refined through multiple iterations


 -->

<script lang="ts">
</script>

<div class="container h-full mx-auto flex flex-col justify-center space-y-5 mt-5">
	<h1 class="pt-3">About the 6 Building Blocks</h1>
    <p>Inspired by this video from Jeff Su</p>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/jC4v5AS4RIM?si=Vd9pLM6Jd_iy7jma" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

    <p>I wanted a tool that would allow me to quickly iterate on these 6 components.</p>
    <p>2 paths: ChatGPT Custom Instructions, and Web Interface</p>

    <h2>Custom Instructions:</h2>
    <details>
        <summary>What would you like ChatGPT to know about you to provide better responses?</summary>
<b>Six Building Blocks of a Good Prompt:</b>
<li>a. Task: The main action you want to be executed.  Begin with an action verb. Specify the end goal. Can be simple or complex.</li>
<li>b. Context: Background or conditions to guide the task. Provides guidance. Ask these questions:</li>
<li>- User’s background?</li>
<li>- What does success look like?</li>
<li>- What environment are they in?</li>
<li>c. Exemplars: Examples or structures to guide the response. Including examples within prompts improves output quality.</li>
<li>d. Persona: The identity or expertise you want the model to assume. Think of an expert you’d want advice from. Can even use fictional characters.</li>
<li>e. Format: The visual layout or presentation of the desired output.  Visualize the end result. Common formats: emails, tables, bullet points, code blocks, and paragraphs in markdown.</li>
<li>f. Tone: The voice or mood in which the response should be delivered. Specify the mood of the response. Pro tip: Describe the feeling you’re going for.</li>
<b>Order of Importance:</b>
<li>Mandatory: Task</li>
<li>Important: Context and Exemplars</li>
<li>Nice to have: Persona, Format, and Tone</li>

Example:
Construct an email as a senior product marketing manager at Apple who collaborated with Tesla on a new product.
Achieved 12,000 pre-orders, 200% above target.
The email should have sections: a TLDR, project background, business results, and a thank you.
The language should be clear, concise, and convey a confident yet friendly tone.
```
    </details>

    <details>
        <summary>How would you like ChatGPT to respond?</summary>
        <p>Wait for the user to input what they want as a prompt.</p>
        <p>The User will use a * to indicate that they want to expand the prompt</p>
        <p>so, guide them through the prompt creation by asking a series of clarifying questions without formatting. In the end, execute prompt that is to the user's liking.</p>
        <p>Else, simply answer the question as if none of the Custom Instructions were written at all.</p>
    </details>

    <h2>Web Interface:</h2>
    <p>With the web interface I was able to create a system for iterating and improving a prompt by analysing an initial prompt and letting the user chose how to improve it.</p>
</div>

<style lang="postcss">
</style>
