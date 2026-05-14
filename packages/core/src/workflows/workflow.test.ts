import { describe, it, expect } from "vitest";
import { Workflow } from "./workflow";

describe("Workflow", () => {
  it("runs sequential steps and returns final output", async () => {
    const workflow = new Workflow({
      steps: [
        {
          id: "add-2",
          run: (value: number) => value + 2
        },
        {
          id: "times-3",
          run: (value: number) => value * 3
        }
      ]
    });

    const result = await workflow.run<number, number>(4);

    expect(result.output).toBe(18);
    expect(result.snapshots).toHaveLength(2);
    expect(result.snapshots[0].stepId).toBe("add-2");
    expect(result.snapshots[1].stepId).toBe("times-3");
  });

  it("supports conditional steps with when()", async () => {
    const workflow = new Workflow({
      steps: [
        {
          id: "base",
          run: (value: number) => value + 1
        },
        {
          id: "optional",
          when: (value) => (value as number) > 10,
          run: (value: number) => value * 100
        }
      ]
    });

    const result = await workflow.run<number, number>(3);

    expect(result.output).toBe(4);
    expect(result.snapshots).toHaveLength(1);
    expect(result.snapshots[0].stepId).toBe("base");
  });

  it("resumes from saved workflow state", async () => {
    const workflow = new Workflow({
      steps: [
        {
          id: "s1",
          run: (value: number) => value + 1
        },
        {
          id: "s2",
          run: (value: number) => value + 2
        },
        {
          id: "s3",
          run: (value: number) => value + 3
        }
      ]
    });

    const partial = await workflow.run<number, number>(1, {
      resumeFrom: {
        nextStepIndex: 0,
        data: 1,
        snapshots: []
      }
    });

    const resumed = await workflow.run<number, number>(999, {
      resumeFrom: {
        nextStepIndex: 2,
        data: partial.snapshots[1].output,
        snapshots: partial.snapshots.slice(0, 2)
      }
    });

    expect(resumed.output).toBe(7);
    expect(resumed.snapshots).toHaveLength(3);
    expect(resumed.snapshots[2].stepId).toBe("s3");
  });
});
