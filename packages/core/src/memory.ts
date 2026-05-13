export interface MemoryItem {
  id: string;
  type: "fact" | "note" | "tool-result";
  content: string;
  createdAt: number;
}