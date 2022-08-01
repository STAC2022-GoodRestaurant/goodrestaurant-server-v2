import { Column } from "typeorm";
import { Model } from "../public/model";

export class UserModel extends Model {
  @Column({ type: "varchar", length: 40 })
  email!: string;

  @Column({ type: "varchar", length: 10 })
  name!: string;

  @Column({ type: "varchar", length: 70 })
  password!: string;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;
}
