// Utility types for the package

// take a type with mandatory fields and make selected fields optional
export type MarkFieldsOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
