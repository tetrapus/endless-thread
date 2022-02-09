interface Link {
  link: string;
  description: string;
}

export interface Task {
  links?: ReadonlyArray<Link>;
  id: string;
  title: string;
  notes?: string;
  position: string;
  parent?: string;
}
