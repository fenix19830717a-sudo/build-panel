export declare enum TaskStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Task {
    id: string;
    userId: string;
    type: string;
    targetType: string;
    targetId: string;
    payload: Record<string, any>;
    status: TaskStatus;
    result: Record<string, any>;
    error: string;
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
}
