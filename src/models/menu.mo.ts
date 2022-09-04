import { Column, Entity, ManyToOne } from "typeorm";
import { Model } from "../public/model";
import { Restaurant } from "./restaurant.mo";

@Entity()
export class Menu extends Model {
  @Column({ type: "varchar", length: 20 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  content!: string;

  @Column({ type: "int" })
  price!: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  imageUrl?: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
  restaurant!: Restaurant;
}
