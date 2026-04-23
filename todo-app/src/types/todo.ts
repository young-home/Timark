export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  order: number;
}

export type FilterType = 'all' | 'active' | 'completed';
export type PriorityType = 'high' | 'medium' | 'low';
