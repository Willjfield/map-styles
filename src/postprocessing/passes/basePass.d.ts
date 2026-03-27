import type { PostPass } from "../types/public";
export declare abstract class BasePass implements PostPass {
    abstract id: string;
    init?(ctx: Parameters<NonNullable<PostPass["init"]>>[0]): void;
    resize?(ctx: Parameters<NonNullable<PostPass["resize"]>>[0]): void;
    abstract render(ctx: Parameters<PostPass["render"]>[0]): void;
    dispose?(ctx: Parameters<NonNullable<PostPass["dispose"]>>[0]): void;
}
