import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
    {
        test: {
            name: "jsdom",
            environment: "jsdom",
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
        },
    },
])
