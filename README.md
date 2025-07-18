# Splunk App Builder

This project provides a lightweight prototype for generating Splunk apps using a conversational web interface. The server is implemented with Node's built-in modules and uses the official Claude SDK when API keys are supplied.

## Features

- Conversational interface that collects app name, author, version, description and modular input details
- Generates a simple Splunk UCC-style skeleton in the `generated` folder
- Optional Claude-based code generation when either `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` is set
- Attempts to bootstrap a Splunk UCC add-on using `ucc-gen` if available
- Download the generated app as a zip archive

This implementation uses placeholders for the actual Splunk UCC generator and CI/CD pipeline. It is intended only as a starting point for a more full‑featured solution.
Running with one of the API keys will call Claude via the Anthropic SDK or OpenRouter to produce a sample `addon.py` file.

## Running

```bash
node server.js
```

Set `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` to enable automatic code generation.
Run `npm test` to execute a basic sanity check of the Claude helper.

Visit `http://localhost:3000` in your browser.
