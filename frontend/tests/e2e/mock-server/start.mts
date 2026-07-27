// Entry point Playwright's webServer config runs directly with `node`
// (see ../port.ts for the shared port constant). Relative imports need
// explicit ".ts" extensions here -- see the note at the top of server.ts.
import { createMockServer } from "./server.mts";
import { MOCK_SERVER_PORT } from "../port.ts";

const server = createMockServer();
server.listen(MOCK_SERVER_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[mock-server] listening on http://localhost:${MOCK_SERVER_PORT}`);
});
