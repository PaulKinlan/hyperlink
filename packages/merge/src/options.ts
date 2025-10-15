import type { MergeSettings, ProviderConfig, ProviderType } from './types';
import { DEFAULT_SETTINGS, DEFAULT_MODELS } from './types';
import { ProviderFactory } from './providers';

// DOM Elements
const providerListEl = document.getElementById(
  'providerList',
) as HTMLDivElement;
const emptyStateEl = document.getElementById('emptyState') as HTMLDivElement;
const configFormEl = document.getElementById('configForm') as HTMLDivElement;
const formTitleEl = document.getElementById('formTitle') as HTMLHeadingElement;
const statusMessageEl = document.getElementById(
  'statusMessage',
) as HTMLDivElement;
const addProviderBtn = document.getElementById(
  'addProviderBtn',
) as HTMLButtonElement;
const providerTypeSelect = document.getElementById(
  'providerType',
) as HTMLSelectElement;
const providerNameInput = document.getElementById(
  'providerName',
) as HTMLInputElement;
const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const modelSelect = document.getElementById('model') as HTMLSelectElement;
const baseUrlInput = document.getElementById('baseUrl') as HTMLInputElement;
const customUrlGroup = document.getElementById(
  'customUrlGroup',
) as HTMLDivElement;
const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;

// State
let settings: MergeSettings = DEFAULT_SETTINGS;
let currentEditingId: string | null = null;
let isNewProvider = false;

// Load settings from storage
async function loadSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['mergeSettings'], (data) => {
      settings = data.mergeSettings || DEFAULT_SETTINGS;
      resolve();
    });
  });
}

// Save settings to storage
async function saveSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ mergeSettings: settings }, resolve);
  });
}

// Show status message
function showStatus(message: string, type: 'success' | 'error' | 'info'): void {
  statusMessageEl.textContent = message;
  statusMessageEl.className = `status-message ${type}`;
  statusMessageEl.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      statusMessageEl.style.display = 'none';
    }, 3000);
  }
}

// Render provider list
function renderProviderList(): void {
  providerListEl.innerHTML = '';

  const providerIds = Object.keys(settings.providers);

  if (providerIds.length === 0) {
    return;
  }

  providerIds.forEach((id) => {
    const provider = settings.providers[id];
    const isActive = settings.activeProviderId === id;

    const item = document.createElement('div');
    item.className = `provider-item ${isActive ? 'active' : ''}`;
    item.dataset.id = id;

    const info = document.createElement('div');
    info.className = 'provider-info';

    const name = document.createElement('div');
    name.className = 'provider-name';
    name.textContent = provider.name;

    const type = document.createElement('div');
    type.className = 'provider-type';
    type.textContent = getProviderTypeLabel(provider.type);

    info.appendChild(name);
    info.appendChild(type);

    const status = document.createElement('div');
    status.className = 'provider-status';

    const dot = document.createElement('div');
    dot.className = `status-dot ${provider.enabled ? '' : 'inactive'}`;

    status.appendChild(dot);

    item.appendChild(info);
    item.appendChild(status);

    item.addEventListener('click', () => handleProviderSelect(id));

    providerListEl.appendChild(item);
  });
}

// Get provider type label
function getProviderTypeLabel(type: ProviderType): string {
  const labels: Record<ProviderType, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    custom: 'Custom',
  };
  return labels[type] || type;
}

// Handle provider selection
function handleProviderSelect(id: string): void {
  currentEditingId = id;
  isNewProvider = false;

  const provider = settings.providers[id];
  loadProviderIntoForm(provider);

  showConfigForm();
  updateProviderListUI();
}

// Load provider into form
function loadProviderIntoForm(provider: ProviderConfig): void {
  formTitleEl.textContent = 'Edit Provider';
  providerTypeSelect.value = provider.type;
  providerNameInput.value = provider.name;
  apiKeyInput.value = provider.apiKey;
  baseUrlInput.value = provider.baseUrl || '';
  enabledCheckbox.checked = provider.enabled;

  updateModelOptions(provider.type);
  modelSelect.value = provider.model;

  updateCustomUrlVisibility(provider.type);
  deleteBtn.style.display = 'block';
  statusMessageEl.style.display = 'none';
}

// Show config form
function showConfigForm(): void {
  emptyStateEl.style.display = 'none';
  configFormEl.style.display = 'block';
}

// Hide config form
function hideConfigForm(): void {
  emptyStateEl.style.display = 'block';
  configFormEl.style.display = 'none';
  currentEditingId = null;
  isNewProvider = false;
}

// Update provider list UI
function updateProviderListUI(): void {
  const items = providerListEl.querySelectorAll('.provider-item');
  items.forEach((item) => {
    const id = (item as HTMLElement).dataset.id;
    if (id === currentEditingId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Update model options based on provider type
function updateModelOptions(type: ProviderType | ''): void {
  modelSelect.innerHTML = '<option value="">Select a model...</option>';

  if (!type) return;

  const models = DEFAULT_MODELS[type as ProviderType] || [];
  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });

  // Allow custom model entry by making it editable
  if (type !== 'custom') {
    const customOption = document.createElement('option');
    customOption.value = '__custom__';
    customOption.textContent = 'Custom model name...';
    modelSelect.appendChild(customOption);
  }
}

// Update custom URL visibility
function updateCustomUrlVisibility(type: ProviderType | ''): void {
  if (type === 'custom') {
    customUrlGroup.classList.add('visible');
  } else {
    customUrlGroup.classList.remove('visible');
  }
}

// Handle add provider button
addProviderBtn.addEventListener('click', () => {
  isNewProvider = true;
  currentEditingId = null;

  formTitleEl.textContent = 'Add New Provider';
  providerTypeSelect.value = '';
  providerNameInput.value = '';
  apiKeyInput.value = '';
  modelSelect.innerHTML = '<option value="">Select a model...</option>';
  baseUrlInput.value = '';
  enabledCheckbox.checked = true;
  customUrlGroup.classList.remove('visible');
  deleteBtn.style.display = 'none';
  statusMessageEl.style.display = 'none';

  showConfigForm();
  updateProviderListUI();
});

// Handle provider type change
providerTypeSelect.addEventListener('change', (e) => {
  const type = (e.target as HTMLSelectElement).value as ProviderType | '';
  updateModelOptions(type);
  updateCustomUrlVisibility(type);

  // Auto-fill provider name if empty
  if (!providerNameInput.value && type) {
    providerNameInput.value = getProviderTypeLabel(type as ProviderType);
  }
});

// Handle test connection
testBtn.addEventListener('click', async () => {
  statusMessageEl.style.display = 'none';

  const type = providerTypeSelect.value as ProviderType;
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  const baseUrl = baseUrlInput.value.trim() || undefined;

  if (!type || !apiKey || !model) {
    showStatus('Please fill in all required fields', 'error');
    return;
  }

  if (type === 'custom' && !baseUrl) {
    showStatus('Base URL is required for custom providers', 'error');
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = 'Testing...';

  try {
    const testConfig: ProviderConfig = {
      id: 'test',
      name: 'Test',
      type,
      apiKey,
      model,
      baseUrl,
      enabled: true,
      createdAt: Date.now(),
    };

    const provider = ProviderFactory.create(testConfig);
    await provider.generateText(
      'Hello, this is a test. Please respond with "OK".',
    );

    showStatus('✓ Connection successful!', 'success');
  } catch (error) {
    console.error('Test failed:', error);
    showStatus(
      `✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error',
    );
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = 'Test Connection';
  }
});

// Handle save
saveBtn.addEventListener('click', async () => {
  statusMessageEl.style.display = 'none';

  const type = providerTypeSelect.value as ProviderType;
  const name = providerNameInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  const baseUrl = baseUrlInput.value.trim() || undefined;
  const enabled = enabledCheckbox.checked;

  // Validation
  if (!type) {
    showStatus('Please select a provider type', 'error');
    return;
  }

  if (!name) {
    showStatus('Please enter a provider name', 'error');
    return;
  }

  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  if (!model) {
    showStatus('Please select or enter a model', 'error');
    return;
  }

  if (type === 'custom' && !baseUrl) {
    showStatus('Base URL is required for custom providers', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const id = isNewProvider ? `${type}-${Date.now()}` : currentEditingId!;

    const providerConfig: ProviderConfig = {
      id,
      name,
      type,
      apiKey,
      model,
      baseUrl,
      enabled,
      createdAt: isNewProvider ? Date.now() : settings.providers[id].createdAt,
    };

    settings.providers[id] = providerConfig;

    // If this is the first provider or the only enabled one, make it active
    if (
      !settings.activeProviderId ||
      Object.keys(settings.providers).length === 1
    ) {
      settings.activeProviderId = id;
    }

    await saveSettings();

    currentEditingId = id;
    isNewProvider = false;

    renderProviderList();
    updateProviderListUI();

    showStatus('✓ Provider saved successfully!', 'success');
    formTitleEl.textContent = 'Edit Provider';
    deleteBtn.style.display = 'block';
  } catch (error) {
    console.error('Save failed:', error);
    showStatus('Failed to save provider', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
});

// Handle cancel
cancelBtn.addEventListener('click', () => {
  if (currentEditingId) {
    // Reload the current provider
    const provider = settings.providers[currentEditingId];
    loadProviderIntoForm(provider);
    showStatus('Changes cancelled', 'info');
  } else {
    hideConfigForm();
  }
});

// Handle delete
deleteBtn.addEventListener('click', async () => {
  if (!currentEditingId) return;

  if (!confirm('Are you sure you want to delete this provider?')) {
    return;
  }

  deleteBtn.disabled = true;

  try {
    const deletedId = currentEditingId;
    delete settings.providers[deletedId];

    // If this was the active provider, select a new one
    if (settings.activeProviderId === deletedId) {
      const remainingIds = Object.keys(settings.providers);
      settings.activeProviderId =
        remainingIds.length > 0 ? remainingIds[0] : null;
    }

    await saveSettings();

    hideConfigForm();
    renderProviderList();

    showStatus('✓ Provider deleted', 'success');
  } catch (error) {
    console.error('Delete failed:', error);
    showStatus('Failed to delete provider', 'error');
  } finally {
    deleteBtn.disabled = false;
  }
});

// Handle clicking on provider to make it active
providerListEl.addEventListener('dblclick', async (e) => {
  const item = (e.target as HTMLElement).closest(
    '.provider-item',
  ) as HTMLElement;
  if (!item) return;

  const id = item.dataset.id;
  if (!id) return;

  settings.activeProviderId = id;
  await saveSettings();

  renderProviderList();
  showStatus('✓ Active provider updated', 'success');
});

// Initialize
(async () => {
  await loadSettings();
  renderProviderList();

  // If there are providers but none selected, show empty state
  if (Object.keys(settings.providers).length === 0) {
    hideConfigForm();
  }
})();
