export interface ModalConfig<T = any> {
  title?: string;
  data?: T;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
