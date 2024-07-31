import { supportedShikiLanguages } from "~/utils/formatters";
import type { BundledLanguage } from 'shiki';

// `remark-code-blocks` doesn't work anymore and writing remark plugins is a pain (spent about 2 hours on it...), that's why I am trying to do this using regex magic
export async function getCodeBlocksFromMarkdown(markdown: string): Promise<CodeBlock[]> {
    // regular expression to match code blocks with optional title and language
    const codeBlockRegex = /```(?<language>[a-zA-Z0-9_]+)(?::(?<title>[^\n]*))?\n(?<code>[\s\S]*?)```/g;
    const codeBlocks: CodeBlock[] = [];

    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
        const { language, title, code } = match.groups!;

        codeBlocks.push({
            language: getValidatedCodeBlockLanguage(language || 'text'),
            title: title || '',
            text: code.trim()
        });
    }

    return codeBlocks;
}

function getValidatedCodeBlockLanguage(language: string) {
    if (supportedShikiLanguages.includes(language as BundledLanguage)) {
        return language;
    }

    return 'text';
}

interface CodeBlock {
    title: string;
    language: string;
    text: string;
}
