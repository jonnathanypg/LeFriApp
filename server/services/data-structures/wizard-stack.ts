/**
 * wizard-stack.ts
 * 
 * Data Structure 6: LIFO Stack for Legal Intake Wizard Step Backtracking (O(1))
 * Supports undo/redo and step history navigation for complex legal intakes
 * (e.g. gathering facts of a labor dismissal or family custody case).
 */

export interface WizardStepState {
  stepIndex: number;
  stepName: string;
  data: Record<string, any>;
  timestamp: number;
}

export class WizardStepStack {
  private undoStack: WizardStepState[] = [];
  private redoStack: WizardStepState[] = [];

  /**
   * Push new step state (O(1))
   */
  pushStep(stepIndex: number, stepName: string, data: Record<string, any>): void {
    this.undoStack.push({
      stepIndex,
      stepName,
      data,
      timestamp: Date.now()
    });
    // Clear redo stack on new action
    this.redoStack = [];
  }

  /**
   * Current active state (O(1))
   */
  current(): WizardStepState | null {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
  }

  /**
   * Undo: go back to previous step (O(1))
   */
  undo(): WizardStepState | null {
    if (this.undoStack.length <= 1) return null; // Can't undo initial step
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    return this.current();
  }

  /**
   * Redo: re-apply undone step (O(1))
   */
  redo(): WizardStepState | null {
    if (this.redoStack.length === 0) return null;
    const restored = this.redoStack.pop()!;
    this.undoStack.push(restored);
    return restored;
  }

  /**
   * Get all accumulated data merged from base to current step (O(S))
   */
  getMergedData(): Record<string, any> {
    const merged: Record<string, any> = {};
    for (const item of this.undoStack) {
      Object.assign(merged, item.data);
    }
    return merged;
  }

  size(): number {
    return this.undoStack.length;
  }
}
