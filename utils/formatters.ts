import type { LanguageRegistration, BundledLanguage } from 'shiki';
import { bundledLanguagesInfo } from 'shiki';

export function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* Intl.<someFormatter> */

export const supportedShikiLanguages: (BundledLanguage | LanguageRegistration)[] = [
  'js',
  'jsx',
  'json',
  'toml',
  'ts',
  'tsx',
  'vue',
  'vue-html',
  'svelte',
  'css',
  'html',
  'xml',
  'bash',
  'shell',
  'shellscript',
  'bat',
  'batch',
  'cmd',
  'powershell',
  'md',
  'mdc',
  'yaml',
  'yml',
  'python',
  'py',
  'asciidoc',
  'c',
  'c#',
  'cs',
  'csharp',
  'c++',
  'dart',
  'objective-c',
  'objective-cpp',
  'swift',
  'docker',
  'dockerfile',
  'git-commit',
  'git-rebase',
  'go',
  'java',
  'kotlin',
  'gql',
  'http',
  'json',
  'latex',
  'lua',
  'sass',
  'less',
  'markdown',
  'makefile',
  'md',
  'mdx',
  'mdc',
  'nginx',
  'nix',
  'php',
  'scheme',
  'plsql',
  'sql',
  'postcss',
  'prisma',
  'rust',
  'rs',
  'csv',
];

export const supportedShikiLanguagesWithInfo = bundledLanguagesInfo.filter(element => supportedShikiLanguages.includes(element.id as BundledLanguage));
