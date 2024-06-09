import { getOpenAICompletion, getGeminiCompletion } from "./completion.js";

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');

    const openAIKeyInput = document.getElementById('openAIKey');
    const geminiKeyInput = document.getElementById('geminiKey');

    const status = document.getElementById('status');

    const messageForm = document.getElementById('form');
    const messageResponse = document.getElementById('response');
    const contextInput = document.getElementById('context');
    const messageInput = document.getElementById('message');

    const currentAI = document.getElementById('aiSelect');
    const showKeys = document.getElementById('showKeys');

    showKeys.addEventListener('change', (e) => {
        if (showKeys.checked) {
            openAIKeyInput.setAttribute('type', 'text');
            geminiKeyInput.setAttribute('type', 'text');
        } else {
            openAIKeyInput.setAttribute('type', 'password');
            geminiKeyInput.setAttribute('type', 'password');
        }
    });

    currentAI.addEventListener('click', (e) => {
        if (currentAI.innerText.indexOf("OpenAI") == -1) {
            currentAI.innerText = "Currently using OpenAI (click to change)";
        } else {
            currentAI.innerText = "Currently using Gemini (click to change)";
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getContent" }, (response) => {
          if (response && response.content) {
            console.log(response.content);
            contextInput.value = response.content;
          } else {
            console.error("Error retrieving content");
          }
        });
      });

    // Load saved API key
    chrome.storage.sync.get(['openAIKey', 'geminiKey'], (result) => {
        if (result.openAIKey) {
            openAIKeyInput.value = result.openAIKey;
        }
        if (result.geminiKey) {
            geminiKeyInput.value = result.geminiKey;
        }
    });

    // Save API key
    saveButton.addEventListener('click', () => {
        const openAIKey = openAIKeyInput.value;
        const geminiKey = geminiKeyInput.value;

        chrome.storage.sync.set({ openAIKey: openAIKey, geminiKey: geminiKey }, () => {
        status.textContent = 'API keys saved!';
        setTimeout(() => {
            status.textContent = ''; }, 2000);
        });
    });

    messageForm.addEventListener('submit', (e) => {
        console.log("submit");
        e.preventDefault();

        const msg = messageInput.value;
        const context = contextInput.value;

        messageInput.value = "";
        
        messageResponse.innerText = "Submitting...";
        
        if (currentAI.innerText.indexOf('OpenAI') != -1)
            getOpenAICompletion(openAIKeyInput.value, msg, context).then((response) => {
                response.json().then((json) => {
                    if (response.status != 200) {
                        messageResponse.innerHTML = "Error " + response.status + " (" + response.statusText
                            + ") " + json;
                        return;
                    }

                    messageResponse.innerHTML = json.choices[0].message.content;
                });
            });
        else
            getGeminiCompletion(geminiKeyInput.value, msg, context).then((response) => {
                response.json().then((json) => {
                    if (response.status != 200) {
                        messageResponse.innerText = "Error " + response.status + " (" + response.statusText
                        + ") " + json;
                        return;
                    }
                    messageResponse.innerText = '';
                    
                    let parts = json.candidates[0].content.parts;
                    for (let i = 0; i < parts.length; parts++) {
                        messageResponse.innerText += parts[i].text;
                    }
                });
            });
    });
});