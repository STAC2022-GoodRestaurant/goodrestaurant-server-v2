import { Column, Entity, OneToMany } from "typeorm";
import { Model } from "../public/model";
import { Coupon } from "./coupon.mo";
import { Review } from "./review.mo";

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

  @Column({ type: "varchar", length: 20, nullable: true })
  businessRegistration?: string;

  @Column({ type: "boolean", default: false })
  businessVerified!: boolean;

  @OneToMany((type) => Coupon, (coupon) => coupon.user)
  coupons!: Coupon[];

  @OneToMany((type) => Review, (review) => review.writer)
  reviews!: Review[];

  // @ManyToMany(() => Restaurant)
  // @JoinTable()
  // visitedList?: Restaurant[];
}
