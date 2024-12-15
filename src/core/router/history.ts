type Listener = () => void;

export class History {
  private listeners: Set<Listener> = new Set();
  private currentPath: string;

  constructor() {
    this.currentPath = window.location.pathname;
    window.addEventListener('popstate', this.handlePopState);
  }

  listen(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  push(path: string): void {
    window.history.pushState(null, '', path);
    this.currentPath = path;
    this.notify();
  }

  replace(path: string): void {
    window.history.replaceState(null, '', path);
    this.currentPath = path;
    this.notify();
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  private handlePopState = (): void => {
    this.currentPath = window.location.pathname;
    this.notify();
  };

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}