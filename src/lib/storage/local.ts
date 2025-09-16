import { promises as fs } from "fs";
import path from "path";
import { storageRoot } from "@/lib/config";

export class LocalStorageAdapter {
  private root: string;

  constructor() {
    this.root = path.resolve(storageRoot());
  }

  private resolve(key: string) {
    return path.join(this.root, key);
  }

  async save(key: string, buffer: Buffer) {
    const fullPath = this.resolve(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
  }

  async read(key: string) {
    try {
      const fullPath = this.resolve(key);
      return await fs.readFile(fullPath);
    } catch (error) {
      return null;
    }
  }

  async delete(key: string) {
    const fullPath = this.resolve(key);
    await fs.rm(fullPath, { force: true });
  }
}
