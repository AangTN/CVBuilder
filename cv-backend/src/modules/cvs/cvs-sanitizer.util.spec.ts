import { sanitizeContent } from './cvs-sanitizer.util';

describe('cvs-sanitizer.util', () => {
  it('removes unsafe script tags from strings', () => {
    const input = '<p>Hello</p><script>alert(1)</script>';
    const output = sanitizeContent(input);

    expect(output).toBe('<p>Hello</p>');
  });

  it('sanitizes nested object values recursively', () => {
    const input = {
      title: 'Safe',
      description: '<img src=x onerror=alert(1) /><b>OK</b>',
      items: ['<i>Item</i><script>bad()</script>'],
    };

    const output = sanitizeContent(input) as {
      title: string;
      description: string;
      items: string[];
    };

    expect(output.title).toBe('Safe');
    expect(output.description).toBe('<b>OK</b>');
    expect(output.items[0]).toBe('<i>Item</i>');
  });
});
