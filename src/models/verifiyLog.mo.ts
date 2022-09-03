import { Column } from "typeorm";
import { Model } from "../public/model";

export class VerifyLog extends Model {
  @Column({ type: "string" })
  email!: string;

  @Column({ type: "string" })
  verifyCode!: string;

  @Column({ type: "boolean", default: false })
  isSuccess?: boolean;
}
