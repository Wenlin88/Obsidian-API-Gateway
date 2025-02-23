# API Bridge for Obsidian

**API Bridge** is a secure local API server plugin for Obsidian that exposes endpoints for reading, writing, and editing your notes. Additionally, if you're interested in beta testing or want to install the plugin directly from GitHub without going through the official Community Plugins directory, you can use BRAT (Beta Reviewer Auto Update Tool) for a seamless installation and update experience.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
  - [Standard Installation](#standard-installation)
  - [Using BRAT to Install the Plugin](#using-brat-to-install-the-plugin)
- [Running the Plugin Locally](#running-the-plugin-locally)
- [Testing the API Endpoints](#testing-the-api-endpoints)
- [Build and Deployment](#build-and-deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**API Bridge for Obsidian** lets you interact with your Obsidian vault via a local HTTP API. With this plugin, you can:

- **List all notes** in your vault.
- **Read the content** of a specific note.
- **Write or update a note** with new content.

Every API call requires an authentication token passed via the `X-API-Token` header, ensuring that only authorized clients can interact with your data.

Additionally, if you wish to try a beta version or install the plugin directly from GitHub, **BRAT** provides a straightforward method to do so. Note that BRAT is used **only** for installing and updating the plugin directly from its GitHub repository, not as an API gateway.

---

## Features

- **Secure API Endpoints:**
  - Every endpoint requires an `X-API-Token` header (default: `"my-secret-token"`).
- **Key Operations:**
  - `GET /api/notes` – Returns a list of all note files.
  - `GET /api/notes/<encoded_file_path>` – Returns the content of a specific note.
  - `POST /api/notes/<encoded_file_path>` – Creates or updates a note.
- **Configurable Settings:**
  - Easily change the API port and authentication token via a dedicated settings tab within Obsidian.
- **Direct GitHub Installation with BRAT:**
  - Use BRAT to install and receive automatic updates for this plugin directly from the GitHub repository without requiring an intermediary API gateway.

---

## Requirements

- **Obsidian:** The host application for the plugin.
- **Node.js and npm:** [Node.js (v18+)](https://nodejs.org/) along with npm are required.
- **Python:** Needed if you plan to use the included project scaffolding script (`init_project.py`).
- *(Optional)* **BRAT:** A tool designed to install and update beta plugins directly from GitHub.

---

## Installation and Setup

### Standard Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/api-bridge.git
   cd api-bridge
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Build the Plugin:**

   - For development builds (non-minified with source maps):

     ```bash
     npm run dev
     ```

   - For production builds (minified bundle):

     ```bash
     npm run build
     ```

4. **Project Scaffolding (Optional):**  
   If you need to generate or update project files, run:

   ```bash
   python init_project.py
   ```

5. **Install the Plugin in Obsidian:**

   - Navigate to your Obsidian vault’s plugins directory:  
     `<your-vault>/.obsidian/plugins/`
   - Create a new folder (e.g., `api-bridge`) and copy the generated files (`main.js`, `manifest.json`, etc.) into it.
   - Restart Obsidian and enable the plugin from Settings > Community Plugins.

### Using BRAT to Install the Plugin

BRAT provides an easy way to install and manage beta plugins directly from their GitHub repositories.

1. **Open BRAT in Obsidian:**
   - Launch Obsidian and go to the BRAT interface (refer to BRAT’s documentation for details).

2. **Add the Repository:**
   - Enter the GitHub URL for the API Bridge plugin:
     ```
     https://github.com/yourusername/api-bridge
     ```
   - BRAT will fetch the plugin details and prompt you to install it.

3. **Automatic Updates:**
   - Once installed via BRAT, any new release pushed to the repository will be automatically detected, so you always run the latest beta version.
   
*Note:*  
BRAT is designed solely for plugin installation and update management—not as an API gateway.

---

## Running the Plugin Locally

After installation and activation:

- **Startup:**  
  The plugin automatically starts a local API server on port `27124` (default).  
  You can modify this port via the plugin’s settings in Obsidian.
  
- **Settings Tab:**  
  A new “API Bridge Settings” tab appears in Obsidian’s settings, letting you update the port number and the authentication token.

- **Monitoring:**  
  Look for log messages in the developer console, for example:

  ```plaintext
  Loading API Bridge Plugin...
  API Bridge server listening on port 27124
  ```

---

## Testing the API Endpoints

You can test the plugin’s endpoints using the provided Python test script or any REST API client (such as Postman or Curl).

### Using the Python Test Script

1. Verify that the `AUTH_TOKEN` in `test_connection.py` matches the token configured in your plugin settings.
2. Run the script:

   ```bash
   python test_connection.py
   ```

The script will perform these actions:
- **GET** request to list all notes.
- **GET** request to read a specific note.
- **POST** request to create or update a note.

Alternatively, manually test using your preferred REST client at the base URL:
```
http://localhost:27124/api
```
---

## Build and Deployment

- **Development Mode:**
  - Use `npm run dev` to run development builds with detailed source maps.
- **Production Mode:**
  - Execute `npm run build` to generate a production-ready bundle.
- **CI/CD Integration:**
  - A GitHub Actions workflow is provided in `.github/workflows/ci.yml` to automate building and testing.
---

## Contributing
Contributions are welcome! To help improve the project:

1. Fork the repository.
2. Create a new branch with your feature or bug fix.
3. Make sure the project builds correctly and passes tests.
4. Submit a pull request with a clear description of your changes.

Please follow the existing coding standards and add documentation or tests as needed.

---

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.