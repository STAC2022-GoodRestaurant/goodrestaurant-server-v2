import { Geometry } from "geojson";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { Model } from "../public/model";
import { GeometryTransformer } from "../utils/transformers";
import { Category } from "./category.mo";
import { Coupon } from "./coupon.mo";
import { Menu } from "./menu.mo";

@Entity()
export class Restaurant extends Model {
  @Column({ type: "varchar", length: 20 })
  name!: string;

  @Column({ type: "varchar", length: 100 })
  imageUrl!: string;

  @Column({ type: "varchar", length: 50 })
  address!: string;

  @Column({ type: "varchar", length: 200 })
  content!: string;

  @Column({ type: "int", default: 8 })
  coupon_max!: number;

  @Column({ type: "varchar", length: 40 })
  coupon_price!: string;

  @Column({ type: "int", default: 0 })
  rating?: number;

  @Column({
    type: "geometry",
    spatialFeatureType: "Point",
    srid: 4326,
    transformer: new GeometryTransformer(),
  })
  position!: Geometry;

  @OneToMany((type) => Menu, (menu) => menu.restaurant)
  menus!: Menu[];

  @OneToMany((type) => Coupon, (coupon) => coupon.restaurant)
  coupons!: Coupon[];

  @ManyToMany(() => Restaurant)
  @JoinTable()
  categories!: Category[];
}
