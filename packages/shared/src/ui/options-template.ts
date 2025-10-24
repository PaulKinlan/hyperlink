export function getOptionsHTML(extensionName: string): string {
  return `
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>Providers</h1>
        <div class="sidebar-help">Click to edit • Double-click to set as active</div>
      </div>
      <div class="provider-list" id="providerList">
        <!-- Provider items will be dynamically added here -->
      </div>
      <div class="sidebar-footer">
        <button class="add-provider-btn" id="addProviderBtn">
          + Add Provider
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="config-panel" id="configPanel">
        <div class="empty-state" id="emptyState">
          <h2>Welcome to ${extensionName}!</h2>
          <p class="welcome-text">To get started, you'll need to configure an AI provider. Choose the one that works best for you:</p>
          
          <div class="provider-options">
            <div class="provider-option highlight">
              <div class="provider-option-header">
                <strong>✅ Chrome (Built-in AI)</strong>
                <span class="badge free">FREE</span>
              </div>
              <p>No API key required - uses Chrome's built-in AI capabilities</p>
            </div>
            
            <div class="provider-option">
              <div class="provider-option-header">
                <strong>OpenAI</strong>
                <span class="badge paid">Requires API Key</span>
              </div>
              <p>Access GPT models - <a href="https://platform.openai.com/api-keys" target="_blank">Get API key →</a></p>
            </div>
            
            <div class="provider-option">
              <div class="provider-option-header">
                <strong>Anthropic (Claude)</strong>
                <span class="badge paid">Requires API Key</span>
              </div>
              <p>Access Claude models - <a href="https://console.anthropic.com/" target="_blank">Get API key →</a></p>
            </div>
            
            <div class="provider-option">
              <div class="provider-option-header">
                <strong>Google (Gemini)</strong>
                <span class="badge paid">Requires API Key</span>
              </div>
              <p>Access Gemini models - <a href="https://aistudio.google.com/app/api-keys" target="_blank">Get API key →</a></p>
            </div>
            
            <div class="provider-option">
              <div class="provider-option-header">
                <strong>Custom Endpoint</strong>
                <span class="badge">Self-Hosted</span>
              </div>
              <p>Connect to your own OpenAI-compatible API (Ollama, LM Studio, Azure, etc.)</p>
            </div>
          </div>
          
          <div class="quick-start">
            <h3>Quick Start:</h3>
            <ol>
              <li>Click "<strong>+ Add Provider</strong>" below</li>
              <li>Select a provider type</li>
              <li>For Chrome Built-in: Just name it and save (no API key needed!)</li>
              <li>For others: Enter your API key and choose a model</li>
              <li>Click "Save" and you're ready to go!</li>
            </ol>
          </div>
        </div>

        <div id="configForm" style="display: none">
          <h2 id="formTitle">Configure Provider</h2>

          <div id="statusMessage" style="display: none"></div>

          <div class="form-group">
            <label for="providerType">Provider Type</label>
            <select id="providerType">
              <option value="">Select a provider...</option>
              <option value="chrome">Chrome (Built-in) - FREE, no API key needed</option>
              <option value="openai">OpenAI - Requires API key</option>
              <option value="anthropic">Anthropic (Claude) - Requires API key</option>
              <option value="google">Google (Gemini) - Requires API key</option>
              <option value="custom">Custom Endpoint - For self-hosted models</option>
            </select>
            <div class="help-text">Choose Chrome Built-in for a free option with no setup required</div>
          </div>

          <div class="form-group">
            <label for="providerName">Provider Name</label>
            <input type="text" id="providerName" placeholder="e.g., My OpenAI API" />
            <div class="help-text">A friendly name to identify this provider</div>
          </div>

          <button class="btn btn-activate" id="activateBtn" style="display: none; margin-bottom: 20px;">
            Set as Active Provider
          </button>

          <div class="form-group">
            <label for="apiKey">API Key</label>
            <input type="password" id="apiKey" placeholder="Enter your API key" />
            <div class="help-text">Your API key will be stored in Chrome's synchronised storage, and will be accessible only to this extension.</div>
          </div>

          <div class="form-group">
            <label for="model">Model</label>
            <select id="model">
              <option value="">Select a model...</option>
            </select>
            <div class="help-text">Or enter a custom model name</div>
          </div>

          <div class="form-group" id="customUrlGroup">
            <label for="baseUrl">Base URL</label>
            <input type="text" id="baseUrl" placeholder="https://api.example.com/v1" />
            <div class="help-text">
              The base URL for your custom endpoint (e.g., Azure OpenAI, Ollama)
            </div>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="enabled" />
              <label for="enabled">Enable this provider</label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-test" id="testBtn">Test Connection</button>
            <button class="btn btn-primary" id="saveBtn">Save</button>
            <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button class="btn btn-danger" id="deleteBtn" style="margin-left: auto">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
