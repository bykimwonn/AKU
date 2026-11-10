/**
 * The chapters of the experience, in order. The navigation, the dot rail and the
 * keyboard shortcuts all read from this list, so adding a section means adding
 * one entry here and rendering it in App.jsx.
 */
export const SECTIONS = [
  { id: 'envelope', label: 'The envelope', hint: 'Chapter One' },
  { id: 'gallery', label: 'The gallery', hint: 'Chapter Two' },
  { id: 'letter', label: 'Things unsaid', hint: 'Chapter Three' },
  { id: 'gifts', label: 'Three gifts', hint: 'Chapter Four' },
  { id: 'cake', label: 'The cake', hint: 'Chapter Five' },
  { id: 'goodbye', label: 'Goodbye', hint: 'The end, for now' },
];

export const SECTION_IDS = SECTIONS.map((section) => section.id);
