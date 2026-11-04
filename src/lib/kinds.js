// Map the AI's category to one of 12 kinds, and give each a sky-blue colorway.
export const KINDS = ['art', 'music', 'market', 'club', 'film', 'sport', 'food', 'talk', 'party', 'outdoors', 'volunteer', 'tech'];
const ALIAS = { wellness: 'outdoors', culture: 'art', study: 'talk', info_session: 'talk', career: 'talk' };
export const kindFor = (category) => KINDS.includes(category) ? category : (ALIAS[category] || 'club');

const WAYS = [
  { c: ['#9CCBFE', '#1F84FC'], panel: '#1F84FC', ink: '#FFFFFF', sub: '#CFE5FF' },
  { c: ['#B9DAFE', '#1575E6'], panel: '#E3EFFE', ink: '#0F4FA8', sub: '#3A6DB8' },
  { c: ['#8EC2FD', '#0F5FC4'], panel: '#1575E6', ink: '#FFFFFF', sub: '#CFE5FF' },
  { c: ['#C7E1FE', '#1F84FC'], panel: '#FFFFFF', ink: '#0F4FA8', sub: '#3A6DB8' },
  { c: ['#9CCBFE', '#1F84FC'], panel: '#46A0FE', ink: '#FFFFFF', sub: '#E6F2FF' }
];
export const way = (kind) => WAYS[Math.max(0, KINDS.indexOf(kind)) % WAYS.length];
