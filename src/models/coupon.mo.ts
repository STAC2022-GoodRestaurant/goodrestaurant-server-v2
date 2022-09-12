import { Column, Entity, ManyToOne } from "typeorm";
import { Model } from "../public/model";
import { Restaurant } from "./restaurant.mo";
import { UserModel } from "./user.mo";

@Entity()
export class Coupon extends Model {
  @Column({ type: "int" })
  max!: number;

  @Column({ type: "int" })
  visitCount!: number;

  @Column({ type: "boolean", default: false })
  isUsed!: boolean;

  @ManyToOne(() => Restaurant)
  restaurant!: Restaurant;

  @ManyToOne(() => UserModel)
  user!: UserModel;
}
