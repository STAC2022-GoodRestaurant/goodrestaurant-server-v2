import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Model } from "../public/model";
import { Category } from "./category.mo";
import { Coupon } from "./coupon.mo";
import { Menu } from "./menu.mo";

@Entity()
export class Restaurant extends Model {
  @Column({ type: "varchar", length: 20 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  address!: string;

  @Column({ type: "varchar", length: 200 })
  content!: string;

  @OneToMany((type) => Menu, (menu) => menu.restaurant)
  menus!: Menu[];

  @ManyToOne(() => Coupon)
  coupons!: Coupon[];

  @ManyToMany(() => Restaurant)
  @JoinTable()
  categories!: Category[];
}
