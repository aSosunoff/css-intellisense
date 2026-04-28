import bundledClasses from "./classes.json";
import { ClassInfo } from "./load-classes";

class ClassRegistry {
  private static instance: ClassRegistry | null = null;

  private classMap: Record<string, ClassInfo> = bundledClasses;
  private sourceLabel: string = "";

  private constructor() {}

  static getInstance() {
    if (!ClassRegistry.instance) {
      ClassRegistry.instance = new ClassRegistry();
    }

    return ClassRegistry.instance;
  }

  getSnapshot() {
    return {
      classMap: this.classMap,
      sourceLabel: this.sourceLabel,
    };
  }

  setClassMap(classMap: Record<string, ClassInfo>) {
    this.classMap = classMap;
  }

  setSourceLabel(sourceLabel: string) {
    this.sourceLabel = sourceLabel;
  }
}

export const classRegistry = ClassRegistry.getInstance();

export const tools = ClassRegistry.getInstance();
