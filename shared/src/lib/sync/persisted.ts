import * as devalue from "devalue"
import { persisted as _persisted } from "svelte-persisted-store"

export const persisted: typeof _persisted = (key, d, o) => {
    try {
        return _persisted(key, d, o)
    } catch {
        localStorage.setItem(key, "")
        return _persisted(key, d, o)
    }
} 
