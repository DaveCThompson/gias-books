# Future Feature Ideas: Advanced Undo System

> **Status:** Idea / Future Consideration  
> **Priority:** Low (current pragmatic approach is sufficient)

---

## Concept

A sophisticated undo/redo system that tracks all state changes with granular control.

---

## Approaches to Consider

### 1. Zustand Temporal Middleware
- Library: `zundo` or custom immer middleware
- Captures full state snapshots
- Automatic history with no code changes
- Memory cost: ~O(n) where n = history depth

### 2. Command Pattern
- Each action is a Command object with `execute()` and `undo()`
- Fine-grained control
- Can support action grouping ("undo last 5 actions")
- Higher implementation effort

### 3. Event Sourcing
- Store sequence of events, replay to rebuild state
- Enables: time travel debugging, audit log
- Overkill for current scope

---

## When to Revisit

Consider implementing when:
- Books have 50+ pages
- Users request undo for asset operations
- Need to track authoring history/changes

---

## References

- [zundo](https://github.com/charkour/zundo) - Zustand undo middleware
- [use-undo](https://github.com/homerchen19/use-undo) - React undo hook
- [immer patches](https://immerjs.github.io/immer/patches) - Incremental state diffs
