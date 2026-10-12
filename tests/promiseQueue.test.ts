import { describe, expect, it, vi } from "vitest";
import { PromiseQueue } from "../src/promiseQueue";

describe("PromiseQueue", () => {
    it("logs escaped rejections and continues with the next task", async () => {
        const error = new Error("unexpected rejection");
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const nextTask = vi.fn().mockResolvedValue(undefined);
        const completed = new Promise<void>((resolve) => {
            const queue = new PromiseQueue();
            queue.addTask(() => Promise.reject(error));
            queue.addTask(nextTask, () => resolve());
        });

        await completed;

        expect(consoleError).toHaveBeenCalledWith(
            "Unhandled PromiseQueue task rejection",
            error
        );
        expect(nextTask).toHaveBeenCalledOnce();
    });
});

describe("PromiseQueue runTask", () => {
    it("runs each task through the given runner", async () => {
        let runs = 0;
        const result = await new Promise<string | undefined>((resolve) => {
            const queue = new PromiseQueue((task) => {
                runs++;
                return task();
            });
            queue.addTask(() => Promise.resolve("done"), resolve);
        });

        expect(result).toBe("done");
        expect(runs).toBe(1);
    });
});
