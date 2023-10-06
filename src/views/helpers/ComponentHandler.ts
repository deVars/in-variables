export interface WithOnClick {
  onclick: IdHandler;
}

export interface IdHandler {
  (id: number): void | Promise<void>;
}
