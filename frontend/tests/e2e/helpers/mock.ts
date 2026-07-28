import { APIRequestContext } from "@playwright/test";
import { MOCK_SERVER_PORT } from "../port";

export const MOCK_SERVER_URL = `http://localhost:${MOCK_SERVER_PORT}`;

/** Wipes every in-memory collection the mock server holds back to its seed
 * state. Call this in beforeEach so tests never leak state into each other. */
export async function resetMockServer(request: APIRequestContext) {
    await request.post(`${MOCK_SERVER_URL}/__mock__/reset`);
}
