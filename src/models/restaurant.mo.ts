import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Model } from "../public/model";
import { Category } from "./category.mo";
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

  @ManyToMany(() => Restaurant)
  @JoinTable()
  categories!: Category[];
}