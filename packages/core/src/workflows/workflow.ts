export interface WorkflowSnapshot {
  stepIndex: number;
  stepId: string;
  input: unknown;
  output: unknown;
  createdAt: number;
}

export interface WorkflowResumeState {
  nextStepIndex: number;
  data: unknown;
  snapshots: WorkflowSnapshot[];
}

export interface WorkflowRunResult<TOutput> {
  output: TOutput;
  snapshots: WorkflowSnapshot[];
  resumeState: WorkflowResumeState;
}

export type StepHandler<TInput, TOutput> = (
  input: TInput
) => Promise<TOutput> | TOutput;

export type StepCondition<TData> = (
  data: TData
) => Promise<boolean> | boolean;

export interface WorkflowStep<TInput = any, TOutput = any> {
  id: string;
  run: StepHandler<TInput, TOutput>;
  when?: StepCondition<any>;
}

export interface WorkflowConfig {
  steps: WorkflowStep[];
}

export interface WorkflowRunOptions {
  resumeFrom?: WorkflowResumeState;
}

export class Workflow {
  constructor(private config: WorkflowConfig) {}

  async run<TInput = unknown, TOutput = unknown>(
    input: TInput,
    options: WorkflowRunOptions = {}
  ): Promise<WorkflowRunResult<TOutput>> {
    const steps = this.config.steps;
    const resumed = options.resumeFrom;

    let currentData: unknown = resumed ? resumed.data : input;
    let nextStepIndex = resumed ? resumed.nextStepIndex : 0;
    const snapshots = resumed ? [...resumed.snapshots] : [];

    if (nextStepIndex < 0 || nextStepIndex > steps.length) {
      throw new Error(`Invalid resume step index: ${nextStepIndex}`);
    }

    while (nextStepIndex < steps.length) {
      const step = steps[nextStepIndex];

      if (step.when) {
        const shouldRun = await step.when(currentData);
        if (!shouldRun) {
          nextStepIndex++;
          continue;
        }
      }

      const stepInput = currentData;
      const stepOutput = await step.run(stepInput);

      snapshots.push({
        stepIndex: nextStepIndex,
        stepId: step.id,
        input: stepInput,
        output: stepOutput,
        createdAt: Date.now()
      });

      currentData = stepOutput;
      nextStepIndex++;
    }

    const resumeState: WorkflowResumeState = {
      nextStepIndex,
      data: currentData,
      snapshots
    };

    return {
      output: currentData as TOutput,
      snapshots,
      resumeState
    };
  }
}
