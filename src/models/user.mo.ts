import { Column, Entity } from "typeorm";
import { Model } from "../public/model";

@Entity()
export class UserModel extends Model {
  @Column({ type: "varchar", length: 40, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 10 })
  name!: string;

  @Column({ type: "varchar", length: 70 })
  password!: string;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;
}
