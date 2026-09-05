import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ProjectMemory } from "./project-memory.js";

/** File-backed persistence: one JSON file per project. */
export class ProjectStore {
  constructor(private readonly dir = process.env.STILIO_PROJECT_DIR ?? "./projects") {}

  private file(projectId: string): string {
    return path.join(this.dir, `${projectId}.json`);
  }

  async save(memory: ProjectMemory): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file(memory.id), JSON.stringify(memory.toJSON(), null, 2), "utf8");
  }

  async load(projectId: string): Promise<ProjectMemory> {
    const raw = await readFile(this.file(projectId), "utf8");
    return ProjectMemory.fromJSON(JSON.parse(raw));
  }

  async exists(projectId: string): Promise<boolean> {
    try {
      await readFile(this.file(projectId), "utf8");
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<string[]> {
    try {
      const entries = await readdir(this.dir);
      return entries.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
    } catch {
      return [];
    }
  }
}
