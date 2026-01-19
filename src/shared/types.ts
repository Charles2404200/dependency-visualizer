export type DepType = 'dependencies' | 'devDependencies';

export interface RawDeps {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export type SecurityFlag = 'none' | 'deprecated' | 'warning';

export interface DependencyInfo {
  name: string;
  type: DepType;
  requested: string;   // version trong package.json (^x.y.z)
  latest?: string;     // version mới nhất trên npm
  isOutdated?: boolean;
  securityFlag?: SecurityFlag;
  note?: string;
  githubUrl?: string;
}

export interface AnalysisResult {
  deps: DependencyInfo[];
  generatedAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  color?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}
