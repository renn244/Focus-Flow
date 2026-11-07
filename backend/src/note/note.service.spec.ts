import { extractMentionedTaskIds } from './note.service';

describe('extractMentionedTaskIds', () => {
    it('collects task mention ids from nested Tiptap content, once each', () => {
        const doc = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'See ' }, { type: 'taskMention', attrs: { id: 'a1', label: 'One' } }] },
                { type: 'taskList', content: [{ type: 'taskItem', content: [{ type: 'paragraph', content: [{ type: 'taskMention', attrs: { id: 'b2' } }, { type: 'taskMention', attrs: { id: 'a1' } }] }] }] },
                { type: 'mention', attrs: { id: 'ignored' } },
            ],
        };

        expect([...extractMentionedTaskIds(doc)].sort()).toEqual(['a1', 'b2']);
    });

    it('handles empty or missing content', () => {
        expect(extractMentionedTaskIds(undefined).size).toBe(0);
        expect(extractMentionedTaskIds({ type: 'doc' }).size).toBe(0);
    });
});
