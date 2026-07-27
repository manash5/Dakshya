
/// <reference types="jest" />
// compiles it with (it's under src/, which the app's own tsconfig excludes
// entirely). The triple-slash directive pulls in Jest's global types for
// whichever config an editor falls back to, without adding a stray
// tsconfig.json inside the application source tree.

export const mailService = {
  sendTempPassword: jest.fn().mockResolvedValue(undefined),
  sendResetLink: jest.fn().mockResolvedValue(undefined),
};
