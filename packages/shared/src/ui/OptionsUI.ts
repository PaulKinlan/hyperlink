import type {
  AISettings,
  ProviderConfig,
  ProviderType,
} from '../providers/types';
import {
  DEFAULT_MODELS,
  REQUIRES_API_KEY,
  REQUIRES_MODEL_SELECTION,
} from '../providers/models';
import { StorageManager } from '../providers/storage';
import { ProviderFactory } from '../providers/factory';
import { getOptionsHTML } from './options-template';
import { getOptionsStyles } from './styles';

export interface OptionsUIConfig {
  extensionName: string;
  storageKey: string;
}

export class OptionsUI {
  private storage: StorageManager;
  private settings: AISettings = { activeProviderId: null, providers: {} };
  private currentEditingId: string | null = null;
  private isNewProvider = false;
  private extensionName: string;

  constructor(storageKey: string, extensionName: string) {
    this.storage = new StorageManager(storageKey);
    this.extensionName = extensionName;
  }

  async init(): Promise<void> {
    const body = document.getElementById('optionsBody') || document.body;
    await this.render(body);
  }

  async render(container: HTMLElement): Promise<void> {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = getOptionsStyles();
    document.head.appendChild(styleEl);

    // Inject HTML
    container.innerHTML = getOptionsHTML(this.extensionName);

    // Load settings and initialize
    await this.loadSettings();
    this.attachEventListeners();
    this.renderProviderList();

    if (Object.keys(this.settings.providers).length === 0) {
      this.hideConfigForm();
    }
  }

  private async loadSettings(): Promise<void> {
    this.settings = await this.storage.getSettings();
  }

  private async saveSettings(): Promise<void> {
    await this.storage.saveSettings(this.settings);
  }

  private attachEventListeners(): void {
    const addBtn = document.getElementById('addProviderBtn');
    const providerTypeSelect = document.getElementById(
      'providerType',
    ) as HTMLSelectElement;
    const testBtn = document.getElementById('testBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const activateBtn = document.getElementById('activateBtn');
    const providerList = document.getElementById('providerList');

    addBtn?.addEventListener('click', () => this.handleAddProvider());
    providerTypeSelect?.addEventListener('change', (e) =>
      this.handleProviderTypeChange(e),
    );
    testBtn?.addEventListener('click', () => this.handleTestConnection());
    saveBtn?.addEventListener('click', () => this.handleSave());
    cancelBtn?.addEventListener('click', () => this.handleCancel());
    deleteBtn?.addEventListener('click', () => this.handleDelete());
    activateBtn?.addEventListener('click', () => this.handleActivate());
    providerList?.addEventListener('dblclick', (e) =>
      this.handleProviderDoubleClick(e),
    );
  }

  private renderProviderList(): void {
    const listEl = document.getElementById('providerList');
    if (!listEl) return;

    listEl.innerHTML = '';

    const providerIds = Object.keys(this.settings.providers);
    if (providerIds.length === 0) return;

    providerIds.forEach((id) => {
      const provider = this.settings.providers[id];
      const isActive = this.settings.activeProviderId === id;

      const item = document.createElement('div');
      item.className = `provider-item ${isActive ? 'active' : ''}`;
      item.dataset.id = id;

      const radioIndicator = document.createElement('div');
      radioIndicator.className = 'radio-indicator';
      radioIndicator.textContent = isActive ? '◉' : '○';

      const info = document.createElement('div');
      info.className = 'provider-info';

      const name = document.createElement('div');
      name.className = 'provider-name';
      name.textContent = provider.name;

      const type = document.createElement('div');
      type.className = 'provider-type';
      type.textContent = this.getProviderTypeLabel(provider.type);

      info.appendChild(name);
      info.appendChild(type);

      const status = document.createElement('div');
      status.className = 'provider-status';

      const dot = document.createElement('div');
      dot.className = `status-dot ${provider.enabled ? '' : 'inactive'}`;

      status.appendChild(dot);
      item.appendChild(radioIndicator);
      item.appendChild(info);
      item.appendChild(status);

      item.addEventListener('click', () => this.handleProviderSelect(id));
      listEl.appendChild(item);
    });
  }

  private getProviderTypeLabel(type: ProviderType): string {
    const labels: Record<ProviderType, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      chrome: 'Chrome',
      custom: 'Custom',
    };
    return labels[type] || type;
  }

  private handleProviderSelect(id: string): void {
    this.currentEditingId = id;
    this.isNewProvider = false;

    const provider = this.settings.providers[id];
    this.loadProviderIntoForm(provider);
    this.showConfigForm();
    this.updateProviderListUI();
  }

  private loadProviderIntoForm(provider: ProviderConfig): void {
    const formTitle = document.getElementById('formTitle');
    const providerTypeSelect = document.getElementById(
      'providerType',
    ) as HTMLSelectElement;
    const providerNameInput = document.getElementById(
      'providerName',
    ) as HTMLInputElement;
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('model') as HTMLSelectElement;
    const baseUrlInput = document.getElementById('baseUrl') as HTMLInputElement;
    const enabledCheckbox = document.getElementById(
      'enabled',
    ) as HTMLInputElement;
    const deleteBtn = document.getElementById('deleteBtn');
    const statusMessage = document.getElementById('statusMessage');

    if (formTitle) formTitle.textContent = 'Edit Provider';
    if (providerTypeSelect) providerTypeSelect.value = provider.type;
    if (providerNameInput) providerNameInput.value = provider.name;
    if (apiKeyInput) apiKeyInput.value = provider.apiKey || '';
    if (baseUrlInput) baseUrlInput.value = provider.baseUrl || '';
    if (enabledCheckbox) enabledCheckbox.checked = provider.enabled;

    this.updateModelOptions(provider.type);
    if (modelSelect) modelSelect.value = provider.model || '';

    this.updateCustomUrlVisibility(provider.type);
    this.updateApiKeyVisibility(provider.type);
    this.updateModelVisibility(provider.type);
    this.updateActivateButtonVisibility();
    if (deleteBtn) deleteBtn.style.display = 'block';
    if (statusMessage) statusMessage.style.display = 'none';
  }

  private showConfigForm(): void {
    const emptyState = document.getElementById('emptyState');
    const configForm = document.getElementById('configForm');
    if (emptyState) emptyState.style.display = 'none';
    if (configForm) configForm.style.display = 'block';
  }

  private hideConfigForm(): void {
    const emptyState = document.getElementById('emptyState');
    const configForm = document.getElementById('configForm');
    if (emptyState) emptyState.style.display = 'block';
    if (configForm) configForm.style.display = 'none';
    this.currentEditingId = null;
    this.isNewProvider = false;
  }

  private updateProviderListUI(): void {
    const items = document.querySelectorAll('.provider-item');
    items.forEach((item) => {
      const id = (item as HTMLElement).dataset.id;
      if (id === this.currentEditingId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  private updateModelOptions(type: ProviderType | ''): void {
    const modelSelect = document.getElementById('model') as HTMLSelectElement;
    if (!modelSelect) return;

    modelSelect.innerHTML = '<option value="">Select a model...</option>';
    if (!type) return;

    const models = DEFAULT_MODELS[type as ProviderType] || [];
    models.forEach((model) => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });

    if (type !== 'custom') {
      const customOption = document.createElement('option');
      customOption.value = '__custom__';
      customOption.textContent = 'Custom model name...';
      modelSelect.appendChild(customOption);
    }
  }

  private updateCustomUrlVisibility(type: ProviderType | ''): void {
    const customUrlGroup = document.getElementById('customUrlGroup');
    if (!customUrlGroup) return;

    if (type === 'custom') {
      customUrlGroup.classList.add('visible');
    } else {
      customUrlGroup.classList.remove('visible');
    }
  }

  private updateApiKeyVisibility(type: ProviderType | ''): void {
    const apiKeyGroup = document
      .getElementById('apiKey')
      ?.closest('.form-group') as HTMLElement;
    if (!apiKeyGroup) return;

    if (type && !REQUIRES_API_KEY[type as ProviderType]) {
      apiKeyGroup.style.display = 'none';
    } else {
      apiKeyGroup.style.display = 'block';
    }
  }

  private updateModelVisibility(type: ProviderType | ''): void {
    const modelGroup = document
      .getElementById('model')
      ?.closest('.form-group') as HTMLElement;
    if (!modelGroup) return;

    if (type && !REQUIRES_MODEL_SELECTION[type as ProviderType]) {
      modelGroup.style.display = 'none';
    } else {
      modelGroup.style.display = 'block';
    }
  }

  private handleAddProvider(): void {
    this.isNewProvider = true;
    this.currentEditingId = null;

    const formTitle = document.getElementById('formTitle');
    const providerTypeSelect = document.getElementById(
      'providerType',
    ) as HTMLSelectElement;
    const providerNameInput = document.getElementById(
      'providerName',
    ) as HTMLInputElement;
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('model') as HTMLSelectElement;
    const baseUrlInput = document.getElementById('baseUrl') as HTMLInputElement;
    const enabledCheckbox = document.getElementById(
      'enabled',
    ) as HTMLInputElement;
    const customUrlGroup = document.getElementById('customUrlGroup');
    const deleteBtn = document.getElementById('deleteBtn');
    const statusMessage = document.getElementById('statusMessage');

    if (formTitle) formTitle.textContent = 'Add New Provider';
    if (providerTypeSelect) providerTypeSelect.value = '';
    if (providerNameInput) providerNameInput.value = '';
    if (apiKeyInput) apiKeyInput.value = '';
    if (modelSelect)
      modelSelect.innerHTML = '<option value="">Select a model...</option>';
    if (baseUrlInput) baseUrlInput.value = '';
    if (enabledCheckbox) enabledCheckbox.checked = true;
    if (customUrlGroup) customUrlGroup.classList.remove('visible');
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (statusMessage) statusMessage.style.display = 'none';

    this.showConfigForm();
    this.updateProviderListUI();
  }

  private handleProviderTypeChange(e: Event): void {
    const type = (e.target as HTMLSelectElement).value as ProviderType | '';
    this.updateModelOptions(type);
    this.updateCustomUrlVisibility(type);
    this.updateApiKeyVisibility(type);
    this.updateModelVisibility(type);

    const providerNameInput = document.getElementById(
      'providerName',
    ) as HTMLInputElement;
    if (!providerNameInput?.value && type) {
      providerNameInput.value = this.getProviderTypeLabel(type as ProviderType);
    }
  }

  private async handleTestConnection(): Promise<void> {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) statusMessage.style.display = 'none';

    const providerTypeSelect = document.getElementById(
      'providerType',
    ) as HTMLSelectElement;
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('model') as HTMLSelectElement;
    const baseUrlInput = document.getElementById('baseUrl') as HTMLInputElement;
    const testBtn = document.getElementById('testBtn') as HTMLButtonElement;

    const type = providerTypeSelect?.value as ProviderType;
    const apiKey = apiKeyInput?.value.trim() || undefined;
    const model = modelSelect?.value || undefined;
    const baseUrl = baseUrlInput?.value.trim() || undefined;

    // Validation based on provider requirements
    if (!type) {
      this.showStatus('Please select a provider type', 'error');
      return;
    }

    if (REQUIRES_API_KEY[type] && !apiKey) {
      this.showStatus('API key is required for this provider', 'error');
      return;
    }

    if (REQUIRES_MODEL_SELECTION[type] && !model) {
      this.showStatus('Model selection is required for this provider', 'error');
      return;
    }

    if (type === 'custom' && !baseUrl) {
      this.showStatus('Base URL is required for custom providers', 'error');
      return;
    }

    if (testBtn) {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
    }

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

      this.showStatus('✓ Connection successful!', 'success');
    } catch (error) {
      console.error('Test failed:', error);
      this.showStatus(
        `✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    } finally {
      if (testBtn) {
        testBtn.disabled = false;
        testBtn.textContent = 'Test Connection';
      }
    }
  }

  private async handleSave(): Promise<void> {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) statusMessage.style.display = 'none';

    const providerTypeSelect = document.getElementById(
      'providerType',
    ) as HTMLSelectElement;
    const providerNameInput = document.getElementById(
      'providerName',
    ) as HTMLInputElement;
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('model') as HTMLSelectElement;
    const baseUrlInput = document.getElementById('baseUrl') as HTMLInputElement;
    const enabledCheckbox = document.getElementById(
      'enabled',
    ) as HTMLInputElement;
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    const formTitle = document.getElementById('formTitle');
    const deleteBtn = document.getElementById('deleteBtn');

    const type = providerTypeSelect?.value as ProviderType;
    const name = providerNameInput?.value.trim();
    const apiKey = apiKeyInput?.value.trim() || undefined;
    const model = modelSelect?.value || undefined;
    const baseUrl = baseUrlInput?.value.trim() || undefined;
    const enabled = enabledCheckbox?.checked ?? true;

    // Validation based on provider requirements
    if (!type) {
      this.showStatus('Please select a provider type', 'error');
      return;
    }
    if (!name) {
      this.showStatus('Please enter a provider name', 'error');
      return;
    }
    if (REQUIRES_API_KEY[type] && !apiKey) {
      this.showStatus('API key is required for this provider', 'error');
      return;
    }
    if (REQUIRES_MODEL_SELECTION[type] && !model) {
      this.showStatus('Model selection is required for this provider', 'error');
      return;
    }
    if (type === 'custom' && !baseUrl) {
      this.showStatus('Base URL is required for custom providers', 'error');
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      const id = this.isNewProvider
        ? `${type}-${Date.now()}`
        : this.currentEditingId!;

      const providerConfig: ProviderConfig = {
        id,
        name,
        type,
        apiKey,
        model,
        baseUrl,
        enabled,
        createdAt: this.isNewProvider
          ? Date.now()
          : this.settings.providers[id].createdAt,
      };

      this.settings.providers[id] = providerConfig;

      if (
        !this.settings.activeProviderId ||
        Object.keys(this.settings.providers).length === 1
      ) {
        this.settings.activeProviderId = id;
      }

      await this.saveSettings();

      this.currentEditingId = id;
      this.isNewProvider = false;

      this.renderProviderList();
      this.updateProviderListUI();
      this.updateActivateButtonVisibility();

      this.showStatus('✓ Provider saved successfully!', 'success');
      if (formTitle) formTitle.textContent = 'Edit Provider';
      if (deleteBtn) deleteBtn.style.display = 'block';
    } catch (error) {
      console.error('Save failed:', error);
      this.showStatus('Failed to save provider', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    }
  }

  private handleCancel(): void {
    if (this.currentEditingId) {
      const provider = this.settings.providers[this.currentEditingId];
      this.loadProviderIntoForm(provider);
      this.showStatus('Changes cancelled', 'info');
    } else {
      this.hideConfigForm();
    }
  }

  private async handleDelete(): Promise<void> {
    if (!this.currentEditingId) return;

    if (!confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
    if (deleteBtn) deleteBtn.disabled = true;

    try {
      const deletedId = this.currentEditingId;
      delete this.settings.providers[deletedId];

      if (this.settings.activeProviderId === deletedId) {
        const remainingIds = Object.keys(this.settings.providers);
        this.settings.activeProviderId =
          remainingIds.length > 0 ? remainingIds[0] : null;
      }

      await this.saveSettings();

      this.hideConfigForm();
      this.renderProviderList();

      this.showStatus('✓ Provider deleted', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      this.showStatus('Failed to delete provider', 'error');
    } finally {
      if (deleteBtn) deleteBtn.disabled = false;
    }
  }

  private async handleActivate(): Promise<void> {
    if (!this.currentEditingId) return;

    this.settings.activeProviderId = this.currentEditingId;
    await this.saveSettings();

    this.renderProviderList();
    this.updateActivateButtonVisibility();
    this.showStatus('✓ Active provider updated', 'success');
  }

  private async handleProviderDoubleClick(e: Event): Promise<void> {
    const item = (e.target as HTMLElement).closest(
      '.provider-item',
    ) as HTMLElement;
    if (!item) return;

    const id = item.dataset.id;
    if (!id) return;

    this.settings.activeProviderId = id;
    await this.saveSettings();

    this.renderProviderList();
    this.updateActivateButtonVisibility();
    this.showStatus('✓ Active provider updated', 'success');
  }

  private updateActivateButtonVisibility(): void {
    const activateBtn = document.getElementById('activateBtn');
    if (!activateBtn) return;

    // Show button only if editing an existing provider that is NOT active
    const isActive = this.currentEditingId === this.settings.activeProviderId;
    activateBtn.style.display =
      !this.isNewProvider && !isActive ? 'block' : 'none';
  }

  private showStatus(
    message: string,
    type: 'success' | 'error' | 'info',
  ): void {
    const statusMessage = document.getElementById('statusMessage');
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    }
  }
}
