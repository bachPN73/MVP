const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\aaaf918f-431f-4657-8de0-6dff40674bb3\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    if (line.includes('PaymentPage.tsx') && line.includes('CodeContent')) {
        try {
            const data = JSON.parse(line);
            const calls = data.tool_calls;
            if (calls) {
                for (const call of calls) {
                    if (call.args && call.args.CodeContent) {
                        // We search for step_index 304 or similar that wrote CodeContent
                        let content = call.args.CodeContent;
                        // Since transcript.jsonl wraps values in JSON, let's see if we need to parse it
                        if (typeof content === 'string' && (content.startsWith('"') || content.startsWith('`'))) {
                            try {
                                content = JSON.parse(content);
                            } catch (e) {
                                // Maybe it's not double stringified, or has another format
                            }
                        }
                        const targetPath = path.resolve('src/pages/PaymentPage.tsx');
                        fs.writeFileSync(targetPath, content, 'utf8');
                        console.log(`Successfully restored PaymentPage.tsx from step ${data.step_index}`);
                        process.exit(0);
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing line:', e);
        }
    }
}
console.log('PaymentPage.tsx not found in logs with CodeContent');
