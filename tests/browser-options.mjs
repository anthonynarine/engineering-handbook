// tests/browser-options.mjs — Use installed macOS Chrome locally and Playwright Chromium on CI.
import fs from 'node:fs';
export function browserOptions(){const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';return {headless:true,...(process.env.HANDBOOK_BROWSER_PATH?{executablePath:process.env.HANDBOOK_BROWSER_PATH}:process.platform==='darwin'&&fs.existsSync(chrome)?{executablePath:chrome}:{})};}
