import {
  formatRelationLabel,
  getNodeId,
  getNodeLabel,
  getNodeType,
  isStructuralRelation,
  NODE_TYPE_STYLES,
  NOISY_NODE_TYPES
} from './graph-utils';

describe('graph-utils', () => {
  describe('getNodeType', () => {
    it('detects documents, hypotheses and patterns from their properties', () => {
      expect(getNodeType({ source_id: 1, name: 'informe.pdf' })).toBe('DOCUMENT');
      expect(getNodeType({ source_id: 1, title: 'Alianza' })).toBe('HYPOTHESIS');
      expect(getNodeType({ type: 'GROWTH', description: 'Crece' })).toBe('PATTERN');
    });

    it('keeps the entity types produced by the AI', () => {
      expect(getNodeType({ name: 'Microsoft', type: 'ORGANIZATION' })).toBe('ORGANIZATION');
      expect(getNodeType({ name: 'Satya Nadella', type: 'person' })).toBe('PERSON');
    });

    it('falls back to ENTITY for unknown types', () => {
      expect(getNodeType({ name: 'X', type: 'SOMETHING' })).toBe('ENTITY');
      expect(getNodeType(null)).toBe('ENTITY');
    });
  });

  describe('getNodeId', () => {
    it('builds the same id for a node and for edges that reference it', () => {
      const entity = { name: 'Microsoft', type: 'ORGANIZATION' };
      expect(getNodeId(entity)).toBe('entity-Microsoft-ORGANIZATION');
      expect(getNodeId({ ...entity })).toBe(getNodeId(entity));
    });

    it('uses the source id for documents', () => {
      expect(getNodeId({ source_id: 7, name: 'a.txt' })).toBe('document-7');
    });

    it('returns an empty id for missing properties', () => {
      expect(getNodeId(undefined)).toBe('');
    });
  });

  it('prefers name, then title, then type as the label', () => {
    expect(getNodeLabel({ name: 'OpenAI', title: 'x' })).toBe('OpenAI');
    expect(getNodeLabel({ title: 'Alianza' })).toBe('Alianza');
    expect(getNodeLabel({}, ['Pattern'])).toBe('Pattern');
    expect(getNodeLabel(null)).toBe('Nodo');
  });

  it('recognizes structural relations', () => {
    expect(isStructuralRelation('MENTIONED_IN')).toBe(true);
    expect(isStructuralRelation('DIRIGE')).toBe(false);
  });

  it('formats relation names for display', () => {
    expect(formatRelationLabel('COMPITE_CON')).toBe('compite con');
    expect(formatRelationLabel(undefined)).toBe('');
  });

  it('defines a style for every node category', () => {
    for (const style of Object.values(NODE_TYPE_STYLES)) {
      expect(style.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(style.size).toBeGreaterThan(0);
      expect(style.label.length).toBeGreaterThan(0);
    }
  });
});

describe('NOISY_NODE_TYPES', () => {
  it('only hides loose numbers by default', () => {
    expect(NOISY_NODE_TYPES).toEqual(['NUMBER']);
  });
});
