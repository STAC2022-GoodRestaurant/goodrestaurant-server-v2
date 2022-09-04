import { Column, Entity } from "typeorm";
import { Model } from "../public/model";

@Entity()
export class VerifyLog extends Model {
  @Column({ type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  verifyCode!: string;

  @Column({ type: "boolean", default: false })
  isSuccess?: boolean;
}
