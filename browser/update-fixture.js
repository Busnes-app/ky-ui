// Loaded by /update/: watches its own entry document every 100ms.
import { watchForUpdate } from '/update.js';
window.stopWatching = watchForUpdate({ name: 'KyIdentity', url: `/update/${location.search}`, interval: 100 });
