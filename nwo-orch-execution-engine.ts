import { ExecutionPacketSchema } from "beast-contracts/orchestration";
import { publishEvent } from "../data/EventPublisher";

export class ExecutionEngine {
  run(packet) {
    const valid = ExecutionPacketSchema.safeParse(packet);
    if (!valid.success) throw new Error("Invalid execution packet");

    const { workflow, phase, context } = valid.data;

    const result = this.executeStep(workflow, phase, context);

    const executionRecord = {
      id: crypto.randomUUID(),
      workflow: workflow.workflow,
      phase,
      context,
      result,
      executedAt: new Date().toISOString()
    };

    publishEvent("orch.execution.completed", executionRecord);
    return executionRecord;
  }

  executeStep(workflow, phase, context) {
    switch (phase) {
      case "init":
        return { status: "initialized", data: context.initData };
      case "execute":
        return { status: "executed", data: context.payload };
      default:
        throw new Error(`Unsupported execution phase: ${phase}`);
    }
  }
}
