import { Column, Entity, ManyToOne } from "typeorm";
import { Model } from "../public/model";
import { UserModel } from "./user.mo";

@Entity()
export class Review extends Model {
  @Column({ type: "varchar" })
  content!: string;

  @Column({ type: "int" })
  rating!: number;

  @ManyToOne(() => UserModel)
  writer!: UserModel;
}
