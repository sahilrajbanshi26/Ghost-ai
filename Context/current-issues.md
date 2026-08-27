fix the drag and drop functionality

## Resolved

6. Nodes can be dragged from the node panel and dropped onto the canvas correctly.

### Drag And Drop Fix

- Shape buttons keep the native `draggable` attribute and write a JSON payload containing `shape`, `width`, and `height`.
- The payload is written to both `application/x-ghost-ai-shape` and `text/plain` for browser compatibility.
- The canvas calls `preventDefault()` during `dragover`, allowing the browser drop event to fire.
- The drop handler stops propagation, reads the payload, validates the shape against the supported definitions, and validates its dimensions.
- React Flow's `screenToFlowPosition` converts the pointer location into canvas coordinates with the current pan and zoom applied.
- Each drop creates a `canvasNode` with an empty label, the selected shape, default size, and a unique shape/timestamp/counter ID.
- The node is inserted through the Liveblocks Flow change handler, so it remains synchronized with collaborators.
- Fixed the `flow.get is not a function` drop crash by removing the pre-seeded plain `flow` object and letting `useLiveblocksFlow` initialize the Liveblocks `LiveObject` storage tree.
- Existing rooms could still contain malformed persisted records from earlier implementations. The canvas now uses a fresh `canvas` storage key, allowing those rooms to initialize a clean Liveblocks Flow object without manual room deletion.
- Normalized the starter nodes to explicit width and height values and added a grab cursor to the custom node renderer so starter and dropped nodes move consistently.

## Verification

- TypeScript passed after the layout changes.
- TypeScript and ESLint passed after the drag/drop fix.
- Production build passed after the Liveblocks storage correction.
- Production build passed after isolating stale persisted room storage under the `diagram` key.
- Production build passed after isolating stale persisted room storage under the `canvas` key.
- Starter and dropped node movement now use the same sized custom renderer.
- The only known lint output is the pre-existing warning in the Clerk skill template.