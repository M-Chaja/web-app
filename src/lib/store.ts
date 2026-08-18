import { useSyncExternalStore } from "react";

/**
 * A minimal external store — the web equivalent of a native `ObservableObject`
 * singleton (`MockAPI.shared`, `AppSession.shared`). Components subscribe via
 * `useStore`; any code (inside or outside React) can read/mutate through the
 * same instance, matching how the native apps access `MockAPI.shared` from
 * anywhere.
 */
export class Store<T> {
  private state: T;
  private listeners = new Set<() => void>();

  constructor(initial: T) {
    this.state = initial;
  }

  get(): T {
    return this.state;
  }

  set(updater: T | ((prev: T) => T)): void {
    const next = typeof updater === "function" ? (updater as (prev: T) => T)(this.state) : updater;
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/** A `Store` that mirrors its value to `localStorage` — the web equivalent of
 *  the native apps' `UserDefaults`/`SharedPreferences`-backed `didSet` pattern. */
export class PersistentStore<T> extends Store<T> {
  private key: string;
  private serialize: (value: T) => string;

  constructor(
    key: string,
    initial: T,
    serialize: (value: T) => string = (value) => JSON.stringify(value),
    deserialize: (raw: string) => T = (raw) => JSON.parse(raw) as T,
  ) {
    super(PersistentStore.readInitial(key, initial, deserialize));
    this.key = key;
    this.serialize = serialize;
  }

  private static readInitial<T>(key: string, initial: T, deserialize: (raw: string) => T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : deserialize(raw);
    } catch {
      return initial;
    }
  }

  override set(updater: T | ((prev: T) => T)): void {
    super.set(updater);
    try {
      localStorage.setItem(this.key, this.serialize(this.get()));
    } catch {
      // localStorage unavailable (private browsing, quota) — state still works in-memory.
    }
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.get(),
  );
}
