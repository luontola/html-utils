import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
    {
        test: {
            name: "jsdom",
            environment: "jsdom",
            include: ["src/**/*.test.ts"],
            exclude: ["src/html-testing3.test.ts"],
        },
    },
    {
        test: {
            name: "browser",
            browser: {
                enabled: true,
                provider: "playwright",
                headless: true,
                instances: [
                    {browser: "chromium"},
                ],
            },
            include: ["src/**/*.test.ts"],
        },
    },
])
