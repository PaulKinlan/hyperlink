export function getOptionsStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
      display: flex;
      height: 100vh;
      background: #f5f5f5;
    }

    .sidebar {
      width: 250px;
      background: #fff;
      border-right: 1px solid #ddd;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #ddd;
      background: #fafafa;
    }

    .sidebar-header h1 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .sidebar-help {
      font-size: 11px;
      color: #999;
      margin-top: 8px;
      line-height: 1.4;
    }

    .provider-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
    }

    .provider-item {
      padding: 12px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.2s;
      border-left: 3px solid transparent;
    }

    .provider-item:hover {
      background: #f5f5f5;
    }

    .provider-item.active {
      background: #e3f2fd;
      border-left-color: #2196f3;
    }

    .radio-indicator {
      font-size: 16px;
      color: #999;
      flex-shrink: 0;
    }

    .provider-item.active .radio-indicator {
      color: #2196f3;
    }

    .provider-info {
      flex: 1;
      min-width: 0;
    }

    .provider-name {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .provider-type {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .provider-status {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4caf50;
    }

    .status-dot.inactive {
      background: #9e9e9e;
    }

    .sidebar-footer {
      padding: 15px 20px;
      border-top: 1px solid #ddd;
    }

    .add-provider-btn {
      width: 100%;
      padding: 10px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .add-provider-btn:hover {
      background: #1976d2;
    }

    .main-content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

    .config-panel {
      max-width: 700px;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .config-panel h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #2196f3;
    }

    .form-group input[type='password'] {
      font-family: monospace;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #2196f3;
      color: white;
    }

    .btn-primary:hover {
      background: #1976d2;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-danger:hover {
      background: #d32f2f;
    }

    .btn-test {
      background: #4caf50;
      color: white;
    }

    .btn-test:hover {
      background: #388e3c;
    }

    .btn-activate {
      background: #ff9800;
      color: white;
    }

    .btn-activate:hover {
      background: #f57c00;
    }

    .empty-state {
      padding: 40px 30px;
      color: #555;
      max-width: 800px;
      margin: 0 auto;
    }

    .empty-state h2 {
      font-size: 24px;
      margin-bottom: 15px;
      color: #333;
      text-align: center;
    }

    .empty-state h3 {
      font-size: 18px;
      margin-bottom: 15px;
      margin-top: 30px;
      color: #333;
    }

    .welcome-text {
      font-size: 15px;
      color: #666;
      margin-bottom: 30px;
      text-align: center;
      line-height: 1.5;
    }

    .provider-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 30px;
    }

    .provider-option {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
      transition: all 0.2s;
    }

    .provider-option:hover {
      border-color: #bbb;
      background: #fff;
    }

    .provider-option.highlight {
      border-color: #4caf50;
      background: #f1f8f4;
    }

    .provider-option-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .provider-option strong {
      font-size: 14px;
      color: #333;
    }

    .provider-option p {
      font-size: 13px;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    .provider-option a {
      color: #2196f3;
      text-decoration: none;
    }

    .provider-option a:hover {
      text-decoration: underline;
    }

    .badge {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.free {
      background: #4caf50;
      color: white;
    }

    .badge.paid {
      background: #ff9800;
      color: white;
    }

    .badge:not(.free):not(.paid) {
      background: #999;
      color: white;
    }

    .quick-start {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #2196f3;
    }

    .quick-start h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }

    .quick-start ol {
      margin-left: 20px;
      line-height: 1.8;
    }

    .quick-start li {
      font-size: 14px;
      color: #555;
    }

    .quick-start strong {
      color: #2196f3;
    }

    .help-text {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox-group input[type='checkbox'] {
      width: auto;
    }

    .status-message {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .status-message.success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }

    .status-message.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }

    .status-message.info {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #90caf9;
    }

    #customUrlGroup {
      display: none;
    }

    #customUrlGroup.visible {
      display: block;
    }
  `;
}
