require("dotenv").config();
import OpenAI from "openai";
import express from "express";
import cors from "cors";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";

const app = express();
app.use(express.json());
app.use(cors());

const client = new OpenAI();

app.post("/template", async (req,res) => {
    const prompt = req.body.prompt;
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }, {role: "system", content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything else."}],
        max_tokens: 1000,
    });

    const answer = response.choices[0].message.content;
    console.log(answer);
    if(answer == "react"){
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you. \n Consider the contents
                of ALL files in this project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }
    if(answer == "node"){
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you. \n Consider the contents
                of ALL files in this project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n - .gitignore\n - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }
})

app.post("/chat", async (req,res) => {
    const messages = req.body.messages;
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{role: "system", content: getSystemPrompt()} ,...messages],
        max_tokens: 8000,
    });
    //console.log(response.choices[0].message.content);
    res.json({
        response: (response.choices[0].message.content)
    });
})





app.listen(3000);

async function main(){
    const stream = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say this is a test" }],
        store: true,
        stream: true,
    });
    
    for await(const chunk of stream){
        console.log(chunk.choices[0].delta.content);
    }
    
}

// main();

