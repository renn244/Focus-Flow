import { countChanges, noteBlocks } from './note-blocks';

const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });

describe('noteBlocks', () => {
    it('flattens paragraphs, headings, nested list items and images, skipping empty paragraphs', () => {
        const doc = {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Plan' }] },
                p('Ship Monday'),
                { type: 'paragraph' },
                {
                    type: 'taskList',
                    content: [{
                        type: 'taskItem',
                        attrs: { checked: true },
                        content: [p('Book room'), { type: 'bulletList', content: [{ type: 'listItem', content: [p('Floor 2')] }] }],
                    }],
                },
                { type: 'image', attrs: { src: '/a.png' } },
                { type: 'paragraph', content: [{ type: 'text', text: 'See ' }, { type: 'taskMention', attrs: { id: 'x', label: 'Login' } }] },
            ],
        };

        expect(noteBlocks(doc)).toEqual(['h2:Plan', 'p:Ship Monday', 'li[x]:Book room', 'li:Floor 2', 'img:/a.png', 'p:See #Login']);
    });

    it('handles a missing or empty document', () => {
        expect(noteBlocks(undefined)).toEqual([]);
        expect(noteBlocks({ type: 'doc' })).toEqual([]);
    });
});

describe('countChanges', () => {
    it('counts a changed block as one removed and one added', () => {
        expect(countChanges(['p:a', 'p:b', 'p:c'], ['p:a', 'p:B', 'p:c', 'p:d'])).toEqual({ added: 2, removed: 1 });
    });

    it('counts everything as added when there was nothing before', () => {
        expect(countChanges([], ['p:a', 'p:b'])).toEqual({ added: 2, removed: 0 });
    });

    it('reports no changes for identical lists', () => {
        expect(countChanges(['p:a', 'hr'], ['p:a', 'hr'])).toEqual({ added: 0, removed: 0 });
    });
});
