import { Column, Entity, OneToMany } from "typeorm";
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

  @OneToMany((type) => Restaurant, (restaurant) => restaurant.coupons)
  restaurant!: Restaurant;

  @OneToMany((type) => UserModel, (userModel) => userModel.coupons)
  user!: UserModel;
}
