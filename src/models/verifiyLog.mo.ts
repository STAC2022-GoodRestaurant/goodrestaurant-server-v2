import { Column } from "typeorm";
import { Model } from "../public/model";

export class VerifyLog extends Model {
  @Column({ type: "number" })
  userId!: number;

  @Column({ type: "number" })
  verifyCode!: number;

  @Column({ type: "boolean", default: false })
  isSuccess!: boolean;
}
