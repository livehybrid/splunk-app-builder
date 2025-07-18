# Splunk App Builder

This project provides a lightweight prototype for generating Splunk apps using a conversational web interface. The server is implemented with Node's built-in modules so no external dependencies are required.

## Features

- Chat-like interface for entering basic app information
- Generates a simple app skeleton in the `generated` folder
- Download the generated app as a zip archive

This implementation uses placeholders for the actual Splunk UCC generator and CI/CD pipeline. It is intended only as a starting point for a more full‑featured solution.

## Running

```bash
node server.js
```

Visit `http://localhost:3000` in your browser.
