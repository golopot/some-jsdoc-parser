export interface ParserState {
  source: string;
  pos: number;
}

export interface JSDocTag {
  type: 'JSDocTag';
  name: string;
  range: [number, number];
}

export interface JSDocTypeAnnotation {
  type: 'JSDocTypeAnnotation';
  value: string;
  range: [number, number];
}

export interface JSDocName {
  type: 'JSDocName';
  name: string;
  optional: boolean;
  range: [number, number];
}

export interface JSDocDescription {
  type: 'JSDocDescription';
  value: string;
  range: [number, number];
}

export interface JSDocBlock {
  type: 'JSDocBlock';
  tag: JSDocTag;
  typeAnnotation: JSDocTypeAnnotation | null;
  name: JSDocName | null;
  description: JSDocDescription | null;
  range: [number, number];
}

export interface JSDocComment {
  type: 'JSDocComment';
  description: JSDocDescription | null;
  blocks: JSDocBlock[];
  range: [number, number];
}
