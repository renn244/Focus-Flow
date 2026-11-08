/**
 * Turns a Tiptap document into a flat list of blocks (paragraphs, headings, list items, images…)
 * so two versions of a note can be compared block by block.
 */
type TiptapNode = { type?: string; text?: string; attrs?: Record<string, unknown>; content?: TiptapNode[] };

const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList']);

const inlineText = (node: TiptapNode | undefined): string => {
    if (!node) return '';
    if (node.type === 'text') return node.text ?? '';
    if (node.type === 'hardBreak') return '\n';
    if (node.type === 'taskMention') return `#${String(node.attrs?.label ?? '')}`;
    return (node.content ?? []).map(inlineText).join('');
};

const walk = (nodes: TiptapNode[] | undefined, out: string[]) => {
    for (const node of nodes ?? []) {
        switch (node.type) {
            case 'paragraph': {
                const text = inlineText(node).trim();
                if (text) out.push(`p:${text}`);
                break;
            }
            case 'heading':
                out.push(`h${String(node.attrs?.level ?? 2)}:${inlineText(node).trim()}`);
                break;
            case 'codeBlock':
                out.push(`code:${inlineText(node)}`);
                break;
            case 'blockquote':
                out.push(`quote:${inlineText(node).trim()}`);
                break;
            case 'image':
                out.push(`img:${String(node.attrs?.src ?? '')}`);
                break;
            case 'horizontalRule':
                out.push('hr');
                break;
            case 'listItem':
            case 'taskItem': {
                const own = (node.content ?? []).filter((child) => !LIST_TYPES.has(child.type ?? ''));
                const checked = node.type === 'taskItem' ? (node.attrs?.checked ? '[x]' : '[ ]') : '';
                out.push(`li${checked}:${own.map(inlineText).join(' ').trim()}`);
                walk((node.content ?? []).filter((child) => LIST_TYPES.has(child.type ?? '')), out);
                break;
            }
            default:
                walk(node.content, out);
        }
    }
    return out;
};

export const noteBlocks = (doc: unknown) => walk((doc as TiptapNode | undefined)?.content, []);

/** How many blocks were added and removed going from `before` to `after`. */
export const countChanges = (before: string[], after: string[]) => {
    // Longest common subsequence: blocks in both, in order, are unchanged.
    let previous = new Array<number>(after.length + 1).fill(0);
    for (let i = 1; i <= before.length; i++) {
        const row = new Array<number>(after.length + 1).fill(0);
        for (let j = 1; j <= after.length; j++) {
            row[j] = before[i - 1] === after[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], row[j - 1]);
        }
        previous = row;
    }
    const same = previous[after.length];
    return { added: after.length - same, removed: before.length - same };
};
